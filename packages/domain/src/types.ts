export type PromotionStatus = "confirmed_allowed" | "restricted" | "not_allowed" | "unknown";
export type Privacy = "public" | "private" | "unknown";
export type JoinAccess = "open_request" | "admin_approval" | "invitation" | "unknown";
export type CountProvenance = "live" | "screenshot" | "historical" | "estimate";
export type Locality = "core" | "edge" | "outside" | "unknown";
export type Confidence = "high" | "medium" | "low";
export type ListingStatus = "published" | "review" | "research";

export type RuleWindow = {
  id: string;
  /** 0 = Sunday … 6 = Saturday, evaluated in the window timezone. */
  weekdays: number[];
  startLocal: string | null;
  endLocal: string | null;
  timeZone: string;
  maxPerWeek: number;
  conditions: string;
};

export type GroupListing = {
  id: string;
  name: string;
  url: string;
  city: string;
  county: string;
  zips: string[];
  locality: Locality;
  distanceMiles: number | null;
  distanceMethod: string;
  memberCount: number | null;
  countCheckedOn: string | null;
  countProvenance: CountProvenance | null;
  privacy: Privacy;
  joinAccess: JoinAccess;
  promotionStatus: PromotionStatus;
  ruleSummary: string;
  categories: string[];
  audience: "business_ads" | "local_community" | "buy_sell";
  evidenceDate: string | null;
  confidence: Confidence;
  windows: RuleWindow[];
  listingStatus: ListingStatus;
  stale: boolean;
  correction: string | null;
  evidenceSummary: string;
  internalNotes: string;
  ambiguousRecurrence: string | null;
  fixture: boolean;
};

export type Eligibility =
  | { ok: true; kind: "verified" | "restricted_confirmed"; notes: string[] }
  | { ok: false; code: string; message: string };

export type PlanDraft = {
  groupId: string;
  windowId: string | null;
  date: string;
  status: "planned" | "done";
  kind: "verified" | "personal_reminder";
};

export type Theme = {
  weekday: number;
  name: string;
  prompt: string;
  studioType: string;
};
