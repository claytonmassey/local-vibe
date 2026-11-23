import type { Eligibility, GroupListing } from "./types";
import { daysBetween } from "./time";

export const MIN_MEMBER_COUNT = 1000;
export const EVIDENCE_FRESH_DAYS = 90;

export function assessEligibility(
  group: GroupListing,
  asOf: string,
  options: { acknowledgeConditions?: boolean } = {},
): Eligibility {
  if (group.listingStatus !== "published") {
    return { ok: false, code: "not_published", message: "This group is still in research and is not a buyer listing." };
  }
  if (group.promotionStatus === "not_allowed") {
    return { ok: false, code: "not_allowed", message: "Promotion is not allowed in this group." };
  }
  if (group.promotionStatus === "unknown") {
    return { ok: false, code: "unknown_status", message: "Promotion status is unknown and needs verification." };
  }
  if (group.memberCount == null || group.countCheckedOn == null) {
    return { ok: false, code: "undated_count", message: "A dated member count is required before a slot can be verified." };
  }
  if (group.memberCount < MIN_MEMBER_COUNT) {
    return { ok: false, code: "subthreshold", message: "The dated count is under 1,000, so the group stays in research." };
  }
  if (group.countProvenance === "estimate") {
    return { ok: false, code: "estimate_unapproved", message: "Estimated counts stay in review until a publisher approves them." };
  }
  if (!group.evidenceDate) {
    return { ok: false, code: "missing_evidence", message: "A dated evidence check is required. A link alone is not permission." };
  }
  if (group.stale || daysBetween(group.evidenceDate, asOf) > EVIDENCE_FRESH_DAYS) {
    return { ok: false, code: "stale_evidence", message: "The rule is stale and needs re-verification before it can be suggested." };
  }
  const windows = group.windows.filter((window) => window.weekdays.length > 0);
  if (windows.length === 0 || group.ambiguousRecurrence) {
    return {
      ok: false,
      code: "no_window",
      message: group.ambiguousRecurrence
        ? "The recurrence is ambiguous, so it is held for review instead of suggested."
        : "No eligible posting window is on file.",
    };
  }
  if (group.promotionStatus === "restricted" && !options.acknowledgeConditions) {
    return {
      ok: false,
      code: "needs_confirmation",
      message: "This group is restricted. Confirm the conditions before adding a slot.",
    };
  }
  return {
    ok: true,
    kind: group.promotionStatus === "restricted" ? "restricted_confirmed" : "verified",
    notes: windows.map((window) => window.conditions).filter(Boolean),
  };
}
