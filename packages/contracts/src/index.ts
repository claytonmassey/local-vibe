import { z } from "zod";

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const signInBody = z.object({
  mode: z.enum(["fixture", "create"]),
  email: z.string().email(),
  name: z.string().min(1).max(80).optional(),
});

export const onboardingBody = z.object({
  businessName: z.string().min(1).max(120),
  category: z.string().min(1).max(80),
  zip: z.string().regex(/^\d{5}$/),
  timeZone: z.string().min(1),
  offerings: z.string().max(500),
  tone: z.string().min(1).max(40),
});

export const addPlanBody = z.object({
  groupId: z.string().min(1),
  windowId: z.string().min(1).optional(),
  date: isoDate,
  kind: z.enum(["verified", "personal_reminder"]).default("verified"),
  acknowledgeConditions: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
});

export const patchPlanBody = z.object({
  revision: z.number().int().nonnegative(),
  status: z.enum(["planned", "done"]).optional(),
  notes: z.string().max(2000).optional(),
  date: isoDate.optional(),
});

export const generateDraftBody = z.object({
  date: isoDate,
  talkingPoints: z.string().max(2000).default(""),
  tone: z.string().min(1).max(40),
  groupId: z.string().optional(),
  planItemId: z.string().optional(),
});

export const patchDraftBody = z.object({
  body: z.string().min(1).max(8000),
  revision: z.number().int().nonnegative(),
});

export const favoriteBody = z.object({ groupId: z.string().min(1) });

export const correctionBody = z.object({
  groupId: z.string().min(1),
  message: z.string().min(8).max(2000),
});

export const checkoutBody = z.object({
  offerId: z.string().min(1),
});

export type ApiErrorBody = { error: { code: string; message: string; requestId: string } };

export type ThemeDto = { weekday: number; name: string; prompt: string; studioType: string };

export type WindowDto = {
  id: string;
  weekdays: number[];
  startLocal: string | null;
  endLocal: string | null;
  timeLabel: string;
  conditions: string;
  maxPerWeek: number;
};

export type GroupCardDto = {
  id: string;
  name: string;
  city: string;
  county: string;
  url: string;
  locality: string;
  distanceLabel: string;
  memberCount: number | null;
  countCheckedOn: string | null;
  countProvenance: string | null;
  privacy: string;
  joinAccess: string;
  promotionStatus: string;
  statusLabel: string;
  ruleSummary: string;
  categories: string[];
  audience: string;
  evidenceDate: string | null;
  evidenceSummary: string;
  confidence: string;
  windows: WindowDto[];
  correction: string | null;
  favorite: boolean;
  sample: boolean;
  fixture: boolean;
};

export type PlanItemDto = {
  id: string;
  revision: number;
  date: string;
  timeLabel: string;
  kind: "verified" | "personal_reminder";
  kindLabel: string;
  status: "planned" | "done";
  groupId: string;
  groupName: string;
  groupUrl: string;
  promotionStatus: string;
  statusLabel: string;
  conditions: string;
  notes: string;
  draftId: string | null;
  city: string;
  distanceLabel: string;
};

export type OpportunityDto = {
  groupId: string;
  groupName: string;
  windowId: string;
  date: string;
  timeLabel: string;
  promotionStatus: string;
  statusLabel: string;
  conditions: string;
  city: string;
  distanceLabel: string;
  needsConfirmation: boolean;
};

export type NoticeDto = { id: string; tone: "info" | "warning"; text: string; href: string };

export type HomeDto = {
  greeting: string;
  displayName: string;
  businessName: string | null;
  timezone: string;
  edition: { id: string; name: string; version: string; publishedOn: string; anchorZip: string } | null;
  entitled: boolean;
  today: string;
  theme: ThemeDto;
  counts: { groups: number; drafts: number; tasks: number };
  week: Array<{ date: string; weekdayShort: string; dayNumber: number; theme: string; active: boolean; hasPlan: boolean }>;
  plan: PlanItemDto[];
  suggestions: OpportunityDto[];
  notices: NoticeDto[];
};

export type SessionDto = {
  token: string;
  user: { id: string; name: string; email: string; role: string };
  needsOnboarding: boolean;
  entitled: boolean;
};

export type OrderDto = {
  id: string;
  status: string;
  amountLabel: string;
  offerName: string;
  mode: "demo" | "stripe";
  createdAt: string;
};

export type AssetDto = { id: string; label: string; kind: "pdf" | "xlsx"; ready: boolean };

export type MeDto = {
  user: { id: string; name: string; email: string; role: string };
  business: {
    id: string;
    name: string;
    category: string;
    zip: string;
    timeZone: string;
    offerings: string;
    tone: string;
    remindersOptIn: boolean;
  } | null;
  entitled: boolean;
  editionName: string | null;
};
