import type { GroupListing } from "@marketmap/domain";

export type Role = "buyer" | "researcher" | "publisher" | "admin";

export type User = { id: string; name: string; email: string; role: Role; passwordHash: string | null };

export type Business = {
  id: string;
  ownerId: string;
  name: string;
  category: string;
  zip: string;
  timeZone: string;
  offerings: string;
  tone: string;
  remindersOptIn: boolean;
};

export type Session = { token: string; userId: string; createdAt: string };

export type Order = {
  id: string;
  userId: string;
  offerId: string;
  status: "pending" | "paid" | "canceled" | "refunded";
  mode: "demo" | "stripe";
  amountCents: number;
  currency: string;
  createdAt: string;
  stripeSessionId: string | null;
};

export type Entitlement = {
  id: string;
  userId: string;
  editionId: string;
  orderId: string;
  status: "active" | "revoked";
};

export type PlanItem = {
  id: string;
  businessId: string;
  editionId: string;
  groupId: string;
  windowId: string | null;
  date: string;
  startLocal: string | null;
  endLocal: string | null;
  timeZone: string;
  kind: "verified" | "personal_reminder";
  status: "planned" | "done";
  notes: string;
  revision: number;
};

export type Draft = {
  id: string;
  businessId: string;
  planItemId: string | null;
  groupId: string | null;
  title: string;
  body: string;
  reminders: string[];
  revision: number;
  createdAt: string;
};

export type Favorite = { businessId: string; groupId: string };

export type Correction = {
  id: string;
  groupId: string;
  userId: string;
  message: string;
  createdAt: string;
  status: "open" | "reviewed";
};

export type HistoryEntry = { id: string; groupId: string | null; at: string; text: string };

export type AssetRecord = {
  id: "directory-pdf" | "directory-xlsx" | "calendar-pdf";
  label: string;
  kind: "pdf" | "xlsx";
  filename: string;
  checksum: string;
  bytesBase64: string;
};

export type Edition = {
  id: string;
  name: string;
  version: string;
  status: "draft" | "published";
  publishedOn: string;
  anchorZip: string;
  coverage: string[];
  edge: string[];
  summary: string;
  supportEmail: string;
  refundSummary: string;
  updateSummary: string;
  priceLabel: string;
  amountCents: number;
  currency: string;
  includes: string[];
  assets: AssetRecord[];
};

export type Offer = {
  id: string;
  editionId: string;
  name: string;
  amountCents: number;
  currency: string;
  active: boolean;
  recurring: boolean;
  hypothesis: boolean;
};

export type Store = {
  seedVersion: number;
  users: User[];
  businesses: Business[];
  sessions: Session[];
  groups: GroupListing[];
  edition: Edition;
  offer: Offer;
  orders: Order[];
  entitlements: Entitlement[];
  planItems: PlanItem[];
  drafts: Draft[];
  favorites: Favorite[];
  corrections: Correction[];
  history: HistoryEntry[];
  stripeEventIds: string[];
};

export const SEED_VERSION = 5;
