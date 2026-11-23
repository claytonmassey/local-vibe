import { describe, expect, it } from "vitest";
import { composeDraft } from "./drafts";
import { assessEligibility } from "./eligibility";
import { ZIP_77354_CENTROID, haversineMiles } from "./distance";
import { mapPromotionCell, validateFacebookGroupRows } from "./import";
import { addPlanItem, opportunitiesForDate } from "./planning";
import { themeForDate } from "./themes";
import { addDays, civilWeekday, startOfWeekMonday, weekDates, zonedLocalToUtc } from "./time";
import type { GroupListing, PlanDraft } from "./types";

function codeOf(result: { ok: boolean; code?: string }): string {
  return result.ok ? "ok" : (result.code ?? "");
}

function group(overrides: Partial<GroupListing> = {}): GroupListing {
  return {
    id: "grp_test",
    name: "Test Group",
    url: "https://facebook.com/groups/fixture",
    city: "Magnolia",
    county: "Montgomery",
    zips: ["77354"],
    locality: "core",
    distanceMiles: 4.2,
    distanceMethod: "straight-line fixture",
    memberCount: 1500,
    countCheckedOn: "2026-11-01",
    countProvenance: "live",
    privacy: "public",
    joinAccess: "open_request",
    promotionStatus: "confirmed_allowed",
    ruleSummary: "Promotions allowed on listed days.",
    categories: ["Professional services"],
    audience: "business_ads",
    evidenceDate: "2026-11-01",
    confidence: "high",
    windows: [
      {
        id: "win_test",
        weekdays: [1],
        startLocal: "13:00",
        endLocal: "16:00",
        timeZone: "America/Chicago",
        maxPerWeek: 1,
        conditions: "One promo per week.",
      },
    ],
    listingStatus: "published",
    stale: false,
    correction: null,
    evidenceSummary: "Checked Nov 1.",
    internalNotes: "fixture",
    ambiguousRecurrence: null,
    fixture: true,
    ...overrides,
  };
}

describe("calendar dates", () => {
  it("keeps Sunday as Setup Sunday and Monday as the week start", () => {
    expect(civilWeekday("2026-11-22")).toBe(0);
    expect(themeForDate("2026-11-22").name).toBe("Setup Sunday");
    expect(themeForDate("2026-11-16").name).toBe("Marketing Monday");
    expect(startOfWeekMonday("2026-11-22")).toBe("2026-11-16");
    expect(weekDates("2027-01-03")[0]).toBe("2026-12-28");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("converts Chicago civil times across standard time and daylight time", () => {
    const winter = zonedLocalToUtc("2026-01-15", "12:00", "America/Chicago");
    const summer = zonedLocalToUtc("2026-07-15", "12:00", "America/Chicago");
    expect(winter?.toISOString()).toBe("2026-01-15T18:00:00.000Z");
    expect(summer?.toISOString()).toBe("2026-07-15T17:00:00.000Z");
    expect(zonedLocalToUtc("2026-03-08", "02:30", "America/Chicago")).toBeNull();
  });
});

describe("eligibility", () => {
  const asOf = "2026-11-22";

  it("accepts a current allowed window", () => {
    expect(assessEligibility(group(), asOf).ok).toBe(true);
  });

  it("rejects thin, estimated, unknown, stale and undated evidence", () => {
    expect(assessEligibility(group({ memberCount: 999 }), asOf).ok).toBe(false);
    expect(codeOf(assessEligibility(group({ countProvenance: "estimate" }), asOf))).toBe("estimate_unapproved");
    expect(codeOf(assessEligibility(group({ promotionStatus: "unknown" }), asOf))).toBe("unknown_status");
    expect(codeOf(assessEligibility(group({ promotionStatus: "not_allowed" }), asOf))).toBe("not_allowed");
    expect(codeOf(assessEligibility(group({ stale: true }), asOf))).toBe("stale_evidence");
    expect(codeOf(assessEligibility(group({ evidenceDate: "2026-01-01" }), asOf))).toBe("stale_evidence");
    expect(codeOf(assessEligibility(group({ countCheckedOn: null }), asOf))).toBe("undated_count");
    expect(codeOf(assessEligibility(group({ windows: [], ambiguousRecurrence: "first Thursday" }), asOf))).toBe("no_window");
  });

  it("requires confirmation before a restricted slot is verified", () => {
    const restricted = group({ promotionStatus: "restricted" });
    expect(codeOf(assessEligibility(restricted, asOf))).toBe("needs_confirmation");
    const confirmed = assessEligibility(restricted, asOf, { acknowledgeConditions: true });
    expect(confirmed.ok && confirmed.kind).toBe("restricted_confirmed");
  });
});

describe("planning", () => {
  const listing = group();
  const existing: PlanDraft[] = [];

  it("suggests the Monday window and refuses a duplicate or a second weekly slot", () => {
    const monday = opportunitiesForDate([listing], "2026-11-16", existing);
    expect(monday).toHaveLength(1);
    expect(opportunitiesForDate([listing], "2026-11-17", existing)).toHaveLength(0);
    const added = addPlanItem({ group: listing, windowId: "win_test", date: "2026-11-16", kind: "verified", existing });
    expect(added.ok).toBe(true);
    const planned: PlanDraft[] = [{ groupId: listing.id, windowId: "win_test", date: "2026-11-16", status: "planned", kind: "verified" }];
    expect(codeOf(addPlanItem({ group: listing, windowId: "win_test", date: "2026-11-16", kind: "verified", existing: planned }))).toBe("duplicate");
    expect(addPlanItem({ group: listing, windowId: "win_test", date: "2026-11-23", kind: "verified", existing: planned }).ok).toBe(true);
    const done: PlanDraft[] = [{ ...planned[0], status: "done" }];
    expect(codeOf(addPlanItem({ group: listing, windowId: "win_test", date: "2026-11-16", kind: "verified", existing: done }))).toBe("duplicate");
  });

  it("lets an off-window note become a personal reminder without erasing the distinction", () => {
    const reminder = addPlanItem({ group: listing, date: "2026-11-18", kind: "personal_reminder", existing });
    expect(reminder.ok && reminder.kind).toBe("personal_reminder");
    expect(codeOf(addPlanItem({ group: listing, windowId: "win_test", date: "2026-11-18", kind: "verified", existing }))).toBe("outside_window");
  });
});

describe("drafts", () => {
  it("does not invent a testimonial or a discount", () => {
    const draft = composeDraft({
      businessName: "Wild Orchid Photography",
      category: "Photography",
      city: "Magnolia",
      zip: "77354",
      offerings: "Family sessions and brand portraits.",
      tone: "Friendly",
      themeName: "Thankful Thursday",
      themePrompt: "Share appreciation, an approved testimonial or community support.",
      talkingPoints: "",
      groupName: "Magnolia Community Businesses",
      conditions: "No direct booking links.",
    });
    expect(draft.body.toLowerCase()).not.toContain("% off");
    expect(draft.body.toLowerCase()).not.toContain("testimonial:");
    expect(draft.reminders.join(" ")).toMatch(/No testimonial was provided/);
    expect(draft.body).toContain("Family sessions and brand portraits.");
  });
});

describe("import and distance", () => {
  it("flags a misleading hyperlink and a verified row with no count date", () => {
    const preview = validateFacebookGroupRows([
      { rowNumber: 5, name: "", urlText: "" },
      {
        rowNumber: 6,
        name: "Example Group",
        urlText: "https://facebook.com/groups/example",
        linkTarget: "https://evil.example/groups/example",
        promotion: "Yes",
        memberCount: "1200",
      },
      { rowNumber: 7, name: "Thin", urlText: "https://facebook.com/groups/thin", promotion: "Maybe", zip: "7735" },
    ]);
    expect(preview.skipped).toBe(1);
    expect(preview.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["misleading_hyperlink", "insufficient_evidence", "unmapped_value", "bad_zip"]),
    );
    expect(mapPromotionCell("Conditional")).toBe("restricted");
  });

  it("measures a straight line from the fixture centroid", () => {
    const miles = haversineMiles(ZIP_77354_CENTROID, { lat: 30.2094, lng: -95.7508 });
    expect(miles).toBe(0);
  });
});
