import { assessEligibility } from "./eligibility";
import { themeForDate } from "./themes";
import { civilWeekday, formatClock, startOfWeekMonday } from "./time";
import type { GroupListing, PlanDraft, RuleWindow } from "./types";

export type Opportunity = {
  group: GroupListing;
  window: RuleWindow;
  date: string;
  timeLabel: string;
  blockedCode?: string;
  blockedMessage?: string;
};

export type AddPlanInput = {
  group: GroupListing;
  windowId?: string | null;
  date: string;
  kind: "verified" | "personal_reminder";
  acknowledgeConditions?: boolean;
  existing: PlanDraft[];
};

export type AddPlanResult =
  | { ok: true; window: RuleWindow | null; kind: "verified" | "personal_reminder" }
  | { ok: false; code: string; message: string };

export function opportunitiesForDate(groups: GroupListing[], date: string, existing: PlanDraft[]): Opportunity[] {
  const weekday = civilWeekday(date);
  const cards: Opportunity[] = [];
  for (const group of groups) {
    for (const window of group.windows) {
      if (!window.weekdays.includes(weekday)) continue;
      const eligibility = assessEligibility(group, date);
      const capped = frequencyReached(existing, group.id, window, date);
      let blockedCode: string | undefined;
      let blockedMessage: string | undefined;
      if (!eligibility.ok && eligibility.code !== "needs_confirmation") {
        blockedCode = eligibility.code;
        blockedMessage = eligibility.message;
      } else if (capped) {
        blockedCode = "frequency_limit";
        blockedMessage = "This group is already at its verified weekly limit.";
      } else if (hasDuplicate(existing, group.id, window.id, date)) {
        blockedCode = "duplicate";
        blockedMessage = "This window is already on the plan.";
      }
      if (blockedCode) continue;
      cards.push({
        group,
        window,
        date,
        timeLabel: formatClock(window.startLocal, window.endLocal),
        blockedCode,
        blockedMessage,
      });
    }
  }
  return cards;
}

export function addPlanItem(input: AddPlanInput): AddPlanResult {
  const window = input.windowId ? input.group.windows.find((item) => item.id === input.windowId) ?? null : null;
  if (input.kind === "personal_reminder") {
    const already = input.existing.some(
      (item) => item.groupId === input.group.id && item.date === input.date && item.kind === "personal_reminder",
    );
    if (already) return { ok: false, code: "duplicate", message: "A personal reminder for this group is already on that date." };
    return { ok: true, window, kind: "personal_reminder" };
  }
  if (!window) return { ok: false, code: "no_window", message: "Choose a verified window or save a personal reminder." };
  if (!window.weekdays.includes(civilWeekday(input.date))) {
    return { ok: false, code: "outside_window", message: "That date is outside the verified days. Save it as a personal reminder instead." };
  }
  const eligibility = assessEligibility(input.group, input.date, { acknowledgeConditions: input.acknowledgeConditions });
  if (!eligibility.ok) return eligibility;
  if (hasDuplicate(input.existing, input.group.id, window.id, input.date)) {
    return { ok: false, code: "duplicate", message: "That group, rule and date are already on the plan." };
  }
  if (frequencyReached(input.existing, input.group.id, window, input.date)) {
    return { ok: false, code: "frequency_limit", message: "The verified frequency limit for this group is already met this week." };
  }
  return { ok: true, window, kind: "verified" };
}

function hasDuplicate(existing: PlanDraft[], groupId: string, windowId: string, date: string): boolean {
  return existing.some((item) => item.groupId === groupId && item.windowId === windowId && item.date === date && item.kind === "verified");
}

function frequencyReached(existing: PlanDraft[], groupId: string, window: RuleWindow, date: string): boolean {
  const week = startOfWeekMonday(date);
  const count = existing.filter(
    (item) => item.groupId === groupId && item.kind === "verified" && startOfWeekMonday(item.date) === week,
  ).length;
  return count >= window.maxPerWeek;
}

export function themeLabel(date: string): string {
  return themeForDate(date).name;
}
