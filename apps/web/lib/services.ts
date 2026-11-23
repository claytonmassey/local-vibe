import { createHash, randomUUID } from "node:crypto";
import {
  addDays,
  addPlanItem,
  assessEligibility,
  civilToday,
  civilWeekday,
  composeDraft,
  daysInMonth,
  formatCivilDate,
  greetingFor,
  monthKey,
  opportunitiesForDate,
  startOfWeekMonday,
  themeForDate,
  validateFacebookGroupRows,
  weekDates,
  weekdayShort,
  dayNumber,
  type GroupListing,
  type PlanDraft,
  type WorkbookRow,
} from "@marketmap/domain";
import type {
  AssetDto,
  GroupCardDto,
  HomeDto,
  MeDto,
  OpportunityDto,
  OrderDto,
  PlanItemDto,
  SessionDto,
  WindowDto,
} from "@marketmap/contracts";
import { ApiError } from "./errors";
import { distanceLabel, money, statusLabel, timeLabel } from "./labels";
import { hashPassword, verifyPassword } from "./password";
import {
  deleteSession,
  findAccount,
  findUserByEmail,
  hasDatabase,
  insertSession,
  insertUser,
  saveBusinessRecord,
  userHasBusiness,
} from "./accounts";
import type { Business, Draft, PlanItem, Store, User } from "./model";
import { readStore, resetStore, updateStore } from "./store";

export type Actor = {
  user: User;
  business: Business | null;
  entitled: boolean;
};

const ZONE = "America/Chicago";

export async function actorFromToken(token: string | null): Promise<Actor | null> {
  if (!token) return null;
  if (hasDatabase()) {
    const account = await findAccount(token);
    if (account) {
      const store = readStore();
      const entitled = store.entitlements.some((item) => item.userId === account.user.id && item.status === "active");
      const business = account.business ?? store.businesses.find((item) => item.ownerId === account.user.id) ?? null;
      return { user: account.user, business, entitled };
    }
  }
  const store = readStore();
  const session = store.sessions.find((item) => item.token === token);
  if (!session) return null;
  const user = store.users.find((item) => item.id === session.userId);
  if (!user) return null;
  const business = store.businesses.find((item) => item.ownerId === user.id) ?? null;
  const entitled = store.entitlements.some((item) => item.userId === user.id && item.status === "active");
  return { user, business, entitled };
}

function requireActor(actor: Actor | null): Actor {
  if (!actor) throw new ApiError(401, "unauthenticated", "Sign in to continue.");
  return actor;
}

function requireBusiness(actor: Actor): Business {
  if (!actor.business) throw new ApiError(422, "needs_onboarding", "Add your business before planning.");
  return actor.business;
}

function requireEntitled(actor: Actor) {
  if (!actor.entitled) throw new ApiError(403, "not_entitled", "The full directory is part of the founding edition.");
}

function requirePublisher(actor: Actor) {
  if (actor.user.role !== "publisher" && actor.user.role !== "admin") {
    throw new ApiError(403, "forbidden", "Publisher access is required.");
  }
}

function openSession(store: Store, user: User): SessionDto {
  const token = randomUUID();
  store.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  const business = store.businesses.find((item) => item.ownerId === user.id) ?? null;
  const entitled = store.entitlements.some((item) => item.userId === user.id && item.status === "active");
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    needsOnboarding: user.role === "buyer" && !business,
    entitled,
  };
}

export async function signUp(input: { name: string; email: string; password: string }): Promise<SessionDto> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (hasDatabase()) {
    const existing = await findUserByEmail(email);
    if (existing) throw new ApiError(409, "account_exists", "An account with that email already exists. Sign in instead.");
    const user: User = { id: randomUUID(), name, email, role: "buyer", passwordHash: hashPassword(input.password) };
    try {
      await insertUser(user);
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && error.code === "23505") {
        throw new ApiError(409, "account_exists", "An account with that email already exists. Sign in instead.");
      }
      throw error;
    }
    const token = randomUUID();
    await insertSession(token, user.id);
    updateStore((store) => {
      store.users.push({ ...user, passwordHash: null });
      store.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
    });
    return { token, user: { id: user.id, name, email, role: user.role }, needsOnboarding: true, entitled: false };
  }
  return updateStore((store) => {
    if (store.users.some((item) => item.email === email)) {
      throw new ApiError(409, "account_exists", "An account with that email already exists. Sign in instead.");
    }
    const user: User = { id: randomUUID(), name, email, role: "buyer", passwordHash: hashPassword(input.password) };
    store.users.push(user);
    return openSession(store, user);
  });
}

export async function signIn(input: { email: string; password: string }): Promise<SessionDto> {
  const email = input.email.trim().toLowerCase();
  if (hasDatabase()) {
    const user = await findUserByEmail(email);
    if (!user || !verifyPassword(input.password, user.passwordHash)) {
      throw new ApiError(401, "invalid_credentials", "That email and password do not match.");
    }
    const token = randomUUID();
    await insertSession(token, user.id);
    const needsOnboarding = user.role === "buyer" && !(await userHasBusiness(user.id));
    const store = readStore();
    const entitled = store.entitlements.some((item) => item.userId === user.id && item.status === "active");
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      needsOnboarding,
      entitled,
    };
  }
  return updateStore((store) => {
    const user = store.users.find((item) => item.email === email);
    if (!user || !verifyPassword(input.password, user.passwordHash)) {
      throw new ApiError(401, "invalid_credentials", "That email and password do not match.");
    }
    return openSession(store, user);
  });
}

export async function signOut(token: string | null) {
  if (!token) return;
  if (hasDatabase()) await deleteSession(token);
  updateStore((store) => {
    store.sessions = store.sessions.filter((item) => item.token !== token);
  });
}

export async function saveBusiness(actor: Actor | null, input: {
  businessName: string;
  category: string;
  zip: string;
  timeZone: string;
  offerings: string;
  tone: string;
  remindersOptIn?: boolean;
}): Promise<MeDto> {
  const current = requireActor(actor);
  const saved = updateStore((store) => {
    const user = store.users.find((item) => item.id === current.user.id) ?? current.user;
    let business = store.businesses.find((item) => item.ownerId === user.id);
    if (!business) {
      business = {
        id: randomUUID(),
        ownerId: user.id,
        name: input.businessName.trim(),
        category: input.category.trim(),
        zip: input.zip,
        timeZone: input.timeZone,
        offerings: input.offerings.trim(),
        tone: input.tone,
        remindersOptIn: Boolean(input.remindersOptIn),
      };
      store.businesses.push(business);
    } else {
      business.name = input.businessName.trim();
      business.category = input.category.trim();
      business.zip = input.zip;
      business.timeZone = input.timeZone;
      business.offerings = input.offerings.trim();
      business.tone = input.tone;
      if (input.remindersOptIn != null) business.remindersOptIn = input.remindersOptIn;
    }
    const entitled = store.entitlements.some((item) => item.userId === user.id && item.status === "active");
    return { profile: meFrom(store, user, business, entitled), business };
  });
  if (hasDatabase()) await saveBusinessRecord(saved.business);
  return saved.profile;
}

export function getMe(actor: Actor | null): MeDto {
  const current = requireActor(actor);
  const store = readStore();
  return meFrom(store, current.user, current.business, current.entitled);
}

function meFrom(store: Store, user: User, business: Business | null, entitled: boolean): MeDto {
  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    business: business
      ? {
          id: business.id,
          name: business.name,
          category: business.category,
          zip: business.zip,
          timeZone: business.timeZone,
          offerings: business.offerings,
          tone: business.tone,
          remindersOptIn: business.remindersOptIn,
        }
      : null,
    entitled,
    editionName: entitled ? store.edition.name : null,
  };
}

export function catalog() {
  const store = readStore();
  const sample = store.groups.filter((group) => group.id === "grp_magnolia" || group.id === "grp_woodlands").map((group) => toGroup(store, group, null, true));
  const { edition } = store;
  return {
    edition: {
      id: edition.id,
      name: edition.name,
      version: edition.version,
      publishedOn: edition.publishedOn,
      anchorZip: edition.anchorZip,
      coverage: edition.coverage,
      edge: edition.edge,
      summary: edition.summary,
      priceLabel: edition.priceLabel,
      includes: edition.includes,
      supportEmail: edition.supportEmail,
      refundSummary: edition.refundSummary,
      updateSummary: edition.updateSummary,
      status: edition.status,
    },
    sample,
    selling: sellingMode(),
  };
}

export function matchQuery(query: string) {
  const store = readStore();
  const q = query.trim().toLowerCase();
  if (!q) return { matched: false, reason: "Enter a ZIP code or a town in the founding area." };
  const zip = q.replace(/\D/g, "");
  if (zip === store.edition.anchorZip || store.groups.some((group) => group.zips.includes(zip) && group.locality === "core")) {
    return { matched: true, area: "core" as const, reason: `${query.toUpperCase()} sits in the Greater Magnolia founding edition.` };
  }
  const edge = store.edition.edge.find((town) => town.toLowerCase() === q) || store.groups.find((group) => group.locality === "edge" && (group.city.toLowerCase() === q || group.zips.includes(zip)));
  if (edge) return { matched: true, area: "edge" as const, reason: `${query} is an edge market. It is labeled separately and only included where the research is current.` };
  const core = store.edition.coverage.find((town) => town.toLowerCase() === q);
  if (core) return { matched: true, area: "core" as const, reason: `${core} is one of the core towns in this edition.` };
  return { matched: false, area: "outside" as const, reason: `${query} is outside this edition. Geographic expansion is later work, not part of the founding release.` };
}

export function getHome(actor: Actor | null, date?: string): HomeDto {
  const current = requireActor(actor);
  const store = readStore();
  const zone = current.business?.timeZone || ZONE;
  const today = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : civilToday(zone);
  const theme = themeForDate(today);
  const mine = current.business ? store.planItems.filter((item) => item.businessId === current.business!.id) : [];
  const week = weekDates(today);
  const drafts = current.business ? store.drafts.filter((item) => item.businessId === current.business!.id) : [];
  const todayItems = mine.filter((item) => item.date === today);
  const suggestions = current.entitled ? opportunitiesForDate(published(store), today, mine.map(toPlanDraft)).map(toOpportunity) : [];
  const notices = noticesFor(store, current);
  return {
    greeting: greetingFor(zone),
    displayName: current.user.name.split(" ")[0] || current.user.name,
    businessName: current.business?.name ?? null,
    timezone: zone,
    edition: current.entitled
      ? { id: store.edition.id, name: store.edition.name, version: store.edition.version, publishedOn: store.edition.publishedOn, anchorZip: store.edition.anchorZip }
      : null,
    entitled: current.entitled,
    today,
    theme,
    counts: {
      groups: todayItems.length,
      drafts: drafts.length,
      tasks: mine.filter((item) => item.status === "planned" && week.includes(item.date)).length,
    },
    week: week.map((iso) => ({
      date: iso,
      weekdayShort: weekdayShort(iso),
      dayNumber: dayNumber(iso),
      theme: themeForDate(iso).name,
      active: iso === today,
      hasPlan: mine.some((item) => item.date === iso),
    })),
    plan: todayItems.map((item) => toPlanItem(store, item)),
    suggestions,
    notices,
  };
}

function noticesFor(store: Store, actor: Actor): HomeDto["notices"] {
  const notices: HomeDto["notices"] = [];
  if (!actor.business) {
    notices.push({ id: "onboarding", tone: "info", text: "Add your business so drafts use your real details.", href: "/onboarding" });
  }
  if (!actor.entitled) {
    notices.push({ id: "edition", tone: "info", text: "The directory, files and verified slots come with the founding edition.", href: "/edition" });
  }
  const waller = store.groups.find((group) => group.id === "grp_waller");
  if (actor.entitled && waller?.correction) {
    notices.push({ id: "waller", tone: "warning", text: `${waller.name}: ${waller.correction}`, href: `/groups/${waller.id}` });
  }
  return notices;
}

export function listGroups(actor: Actor | null, query: Record<string, string | undefined>) {
  const current = requireActor(actor);
  const store = readStore();
  const publisher = current.user.role === "admin" || current.user.role === "publisher";
  let items = store.groups.filter((group) => (publisher && query.scope === "all" ? true : group.listingStatus === "published"));
  if (!current.entitled && !publisher) {
    items = items.filter((group) => group.id === "grp_magnolia" || group.id === "grp_woodlands");
  }
  const q = query.q?.trim().toLowerCase();
  if (q) items = items.filter((group) => `${group.name} ${group.city} ${group.ruleSummary}`.toLowerCase().includes(q));
  if (query.chip === "business_ads") items = items.filter((group) => group.audience === "business_ads");
  if (query.chip === "local") items = items.filter((group) => group.locality === "core");
  if (query.chip === "favorites") {
    const favs = new Set(store.favorites.filter((item) => item.businessId === current.business?.id).map((item) => item.groupId));
    items = items.filter((group) => favs.has(group.id));
  }
  if (query.privacy) items = items.filter((group) => group.privacy === query.privacy);
  if (query.status) items = items.filter((group) => group.promotionStatus === query.status);
  if (query.locality) items = items.filter((group) => group.locality === query.locality);
  if (query.category) items = items.filter((group) => group.categories.includes(query.category!));
  if (query.day) items = items.filter((group) => group.windows.some((window) => window.weekdays.includes(Number(query.day))));
  if (query.membership === "under-5000") items = items.filter((group) => (group.memberCount ?? 0) < 5000);
  if (query.membership === "5000-15000") items = items.filter((group) => (group.memberCount ?? 0) >= 5000 && (group.memberCount ?? 0) < 15000);
  if (query.membership === "15000-plus") items = items.filter((group) => (group.memberCount ?? 0) >= 15000);
  items = [...items].sort((a, b) => (a.distanceMiles ?? 999) - (b.distanceMiles ?? 999));
  const sampleLimited = !current.entitled && !publisher;
  return {
    items: items.map((group) => toGroup(store, group, current.business?.id ?? null, sampleLimited)),
    total: items.length,
    entitled: current.entitled || publisher,
  };
}

export function getGroup(actor: Actor | null, id: string): GroupCardDto & { history: { at: string; text: string }[] } {
  const current = requireActor(actor);
  const store = readStore();
  const group = store.groups.find((item) => item.id === id);
  if (!group) throw new ApiError(404, "not_found", "That group is not in this edition.");
  const publisher = current.user.role === "admin" || current.user.role === "publisher";
  if (group.listingStatus !== "published" && !publisher) throw new ApiError(404, "not_found", "That group is not in this edition.");
  if (!current.entitled && !publisher && group.id !== "grp_magnolia" && group.id !== "grp_woodlands") {
    throw new ApiError(403, "not_entitled", "The full directory is part of the founding edition.");
  }
  const sample = !current.entitled && !publisher;
  return {
    ...toGroup(store, group, current.business?.id ?? null, sample),
    history: store.history.filter((item) => item.groupId === group.id).map((item) => ({ at: item.at, text: item.text })),
  };
}

export function getPlan(actor: Actor | null, from: string, to: string) {
  const current = requireActor(actor);
  const business = requireBusiness(current);
  const store = readStore();
  const items = store.planItems
    .filter((item) => item.businessId === business.id && item.date >= from && item.date <= to)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.startLocal ?? "").localeCompare(b.startLocal ?? ""));
  return { items: items.map((item) => toPlanItem(store, item)) };
}

export function getOpportunities(actor: Actor | null, date: string) {
  const current = requireActor(actor);
  requireEntitled(current);
  const business = requireBusiness(current);
  const store = readStore();
  const existing = store.planItems.filter((item) => item.businessId === business.id);
  return { items: opportunitiesForDate(published(store), date, existing.map(toPlanDraft)).map(toOpportunity), theme: themeForDate(date) };
}

export function getCalendar(actor: Actor | null, from: string, to: string) {
  const current = requireActor(actor);
  const business = current.business;
  const store = readStore();
  const items = business ? store.planItems.filter((item) => item.businessId === business.id) : [];
  const days: Array<{ date: string; posts: number; holiday: string | null; campaign: string | null; theme: string }> = [];
  for (let date = from; date <= to; date = addDays(date, 1)) {
    const markers = markersFor(date);
    days.push({ date, posts: items.filter((item) => item.date === date).length, holiday: markers.holiday, campaign: markers.campaign, theme: themeForDate(date).name });
    if (days.length > 400) break;
  }
  return { days };
}

export function createPlanItem(actor: Actor | null, input: {
  groupId: string;
  windowId?: string;
  date: string;
  kind: "verified" | "personal_reminder";
  acknowledgeConditions?: boolean;
  notes?: string;
}): PlanItemDto {
  const current = requireActor(actor);
  const business = requireBusiness(current);
  if (input.kind === "verified") requireEntitled(current);
  return updateStore((store) => {
    const group = store.groups.find((item) => item.id === input.groupId);
    if (!group) throw new ApiError(404, "not_found", "That group is not in this edition.");
    const existing = store.planItems.filter((item) => item.businessId === business.id);
    const result = addPlanItem({
      group,
      windowId: input.windowId,
      date: input.date,
      kind: input.kind,
      acknowledgeConditions: input.acknowledgeConditions,
      existing: existing.map(toPlanDraft),
    });
    if (!result.ok) throw new ApiError(422, result.code, result.message);
    const item: PlanItem = {
      id: randomUUID(),
      businessId: business.id,
      editionId: store.edition.id,
      groupId: group.id,
      windowId: result.window?.id ?? null,
      date: input.date,
      startLocal: result.window?.startLocal ?? null,
      endLocal: result.window?.endLocal ?? null,
      timeZone: business.timeZone,
      kind: result.kind,
      status: "planned",
      notes: input.notes?.trim() ?? "",
      revision: 1,
    };
    store.planItems.push(item);
    return toPlanItem(store, item);
  });
}

export function patchPlanItem(actor: Actor | null, id: string, input: { revision: number; status?: "planned" | "done"; notes?: string; date?: string }): PlanItemDto & { warning: string | null } {
  const current = requireActor(actor);
  const business = requireBusiness(current);
  return updateStore((store) => {
    const item = store.planItems.find((entry) => entry.id === id && entry.businessId === business.id);
    if (!item) throw new ApiError(404, "not_found", "That plan item is no longer on your week.");
    if (item.revision !== input.revision) throw new ApiError(409, "stale_write", "This plan changed in another session. Reload it, then save again. Your other notes were kept.");
    let warning: string | null = null;
    if (input.date && input.date !== item.date) {
      const group = store.groups.find((entry) => entry.id === item.groupId);
      const window = group?.windows.find((entry) => entry.id === item.windowId);
      const stillVerified = window?.weekdays.includes(civilWeekday(input.date));
      item.date = input.date;
      if (item.kind === "verified" && !stillVerified) {
        item.kind = "personal_reminder";
        warning = "That date is outside the verified window, so this became a personal reminder. Your notes are unchanged.";
      }
    }
    if (input.status) item.status = input.status;
    if (input.notes != null) item.notes = input.notes;
    item.revision += 1;
    return { ...toPlanItem(store, item), warning };
  });
}

export function generateDraft(actor: Actor | null, input: { date: string; talkingPoints: string; tone: string; groupId?: string; planItemId?: string }) {
  const current = requireActor(actor);
  const business = requireBusiness(current);
  return updateStore((store) => {
    const group = input.groupId ? store.groups.find((item) => item.id === input.groupId) : undefined;
    if (input.groupId && !group) throw new ApiError(404, "not_found", "That group is not in this edition.");
    if (group && !current.entitled) requireEntitled(current);
    const theme = themeForDate(input.date);
    const window = group?.windows.find((item) => item.weekdays.includes(civilWeekday(input.date)));
    const composed = composeDraft({
      businessName: business.name,
      category: business.category,
      city: "Magnolia",
      zip: business.zip,
      offerings: business.offerings,
      tone: input.tone || business.tone,
      themeName: theme.name,
      themePrompt: theme.prompt,
      talkingPoints: input.talkingPoints,
      groupName: group?.name,
      conditions: window?.conditions ?? group?.ruleSummary,
    });
    const draft: Draft = {
      id: randomUUID(),
      businessId: business.id,
      planItemId: input.planItemId ?? null,
      groupId: group?.id ?? null,
      title: composed.title,
      body: composed.body,
      reminders: composed.reminders,
      revision: 1,
      createdAt: new Date().toISOString(),
    };
    store.drafts.push(draft);
    return { id: draft.id, title: draft.title, body: draft.body, reminders: draft.reminders, revision: draft.revision, groupUrl: group?.url ?? null };
  });
}

export function latestDraft(actor: Actor | null, date?: string) {
  const current = requireActor(actor);
  const business = requireBusiness(current);
  const store = readStore();
  const drafts = store.drafts.filter((item) => item.businessId === business.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const draft = drafts.find((item) => {
    if (!date) return true;
    const plan = item.planItemId ? store.planItems.find((entry) => entry.id === item.planItemId) : null;
    return plan?.date === date || item.createdAt.startsWith(date);
  });
  if (!draft) return null;
  const group = draft.groupId ? store.groups.find((item) => item.id === draft.groupId) : null;
  return { id: draft.id, title: draft.title, body: draft.body, reminders: draft.reminders, revision: draft.revision, groupUrl: group?.url ?? null, groupName: group?.name ?? null };
}

export function patchDraft(actor: Actor | null, id: string, input: { body: string; revision: number }) {
  const current = requireActor(actor);
  const business = requireBusiness(current);
  return updateStore((store) => {
    const draft = store.drafts.find((item) => item.id === id && item.businessId === business.id);
    if (!draft) throw new ApiError(404, "not_found", "That draft is not on this account.");
    if (draft.revision !== input.revision) throw new ApiError(409, "stale_write", "This draft changed elsewhere. Reload before saving so you do not overwrite it.");
    draft.body = input.body;
    draft.revision += 1;
    return { id: draft.id, body: draft.body, revision: draft.revision };
  });
}

export function setFavorite(actor: Actor | null, groupId: string, favorite: boolean) {
  const current = requireActor(actor);
  const business = requireBusiness(current);
  requireEntitled(current);
  return updateStore((store) => {
    if (!store.groups.some((group) => group.id === groupId && group.listingStatus === "published")) {
      throw new ApiError(404, "not_found", "That group is not in this edition.");
    }
    store.favorites = store.favorites.filter((item) => !(item.businessId === business.id && item.groupId === groupId));
    if (favorite) store.favorites.push({ businessId: business.id, groupId });
    return { favorite };
  });
}

export function createCheckout(actor: Actor | null) {
  const current = requireActor(actor);
  if (sellingMode() === "locked") throw new ApiError(422, "selling_locked", "Live selling is locked until release approvals.");
  return updateStore((store) => {
    const existing = store.entitlements.find((item) => item.userId === current.user.id && item.status === "active");
    if (existing) throw new ApiError(409, "already_owned", "This account already has the founding edition.");
    const order = {
      id: randomUUID(),
      userId: current.user.id,
      offerId: store.offer.id,
      status: "pending" as const,
      mode: "demo" as const,
      amountCents: store.offer.amountCents,
      currency: store.offer.currency,
      createdAt: new Date().toISOString(),
      stripeSessionId: null,
    };
    store.orders.push(order);
    return { order: toOrder(store, order), url: `/checkout/return?order=${order.id}` };
  });
}

export function reconcileOrder(actor: Actor | null, orderId: string): OrderDto {
  const current = requireActor(actor);
  return updateStore((store) => {
    const order = store.orders.find((item) => item.id === orderId && item.userId === current.user.id);
    if (!order) throw new ApiError(404, "not_found", "That order is not on this account.");
    if (order.mode !== "demo") throw new ApiError(422, "stripe_required", "This order has to be confirmed by Stripe, not by the return page.");
    if (order.status === "pending") {
      order.status = "paid";
      const already = store.entitlements.find((item) => item.orderId === order.id);
      if (!already) {
        store.entitlements.push({ id: randomUUID(), userId: current.user.id, editionId: store.edition.id, orderId: order.id, status: "active" });
      }
    }
    return toOrder(store, order);
  });
}

export function refundOrder(actor: Actor | null, orderId: string): OrderDto {
  const current = requireActor(actor);
  return updateStore((store) => {
    const order = store.orders.find((item) => item.id === orderId && item.userId === current.user.id);
    if (!order || order.status !== "paid" || order.mode !== "demo") throw new ApiError(422, "not_refundable", "Only a paid test order can be reset here.");
    order.status = "refunded";
    for (const entitlement of store.entitlements) {
      if (entitlement.orderId === order.id) entitlement.status = "revoked";
    }
    return toOrder(store, order);
  });
}

export function listOrders(actor: Actor | null) {
  const current = requireActor(actor);
  const store = readStore();
  return {
    items: store.orders.filter((item) => item.userId === current.user.id).map((order) => toOrder(store, order)),
    assets: current.entitled ? assetList() : [],
    entitled: current.entitled,
  };
}

export function submitCorrection(actor: Actor | null, groupId: string, message: string) {
  const current = requireActor(actor);
  return updateStore((store) => {
    if (!store.groups.some((group) => group.id === groupId)) throw new ApiError(404, "not_found", "That group is not in this edition.");
    const correction = { id: randomUUID(), groupId, userId: current.user.id, message: message.trim(), createdAt: new Date().toISOString(), status: "open" as const };
    store.corrections.push(correction);
    return { id: correction.id };
  });
}

export function adminQueue(actor: Actor | null) {
  const current = requireActor(actor);
  requirePublisher(current);
  const store = readStore();
  const queue = store.groups.filter((group) => group.listingStatus !== "published" || group.stale || group.promotionStatus === "unknown" || group.ambiguousRecurrence);
  return {
    edition: { name: store.edition.name, version: store.edition.version, status: store.edition.status },
    queue: queue.map((group) => ({
      id: group.id,
      name: group.name,
      city: group.city,
      reason: group.ambiguousRecurrence
        ? `Ambiguous recurrence: ${group.ambiguousRecurrence}`
        : group.stale
          ? "Stale rule"
          : group.memberCount != null && group.memberCount < 1000
            ? "Under 1,000 members"
            : group.countProvenance === "estimate"
              ? "Estimated count"
              : group.promotionStatus === "unknown"
                ? "Promotion status unknown"
                : group.listingStatus,
    })),
    corrections: store.corrections.filter((item) => item.status === "open"),
    history: store.history.filter((item) => item.groupId == null),
    preview: validateFacebookGroupRows(sampleWorkbook()),
  };
}

export function commitImport(actor: Actor | null, commit: boolean) {
  const current = requireActor(actor);
  requirePublisher(current);
  const preview = validateFacebookGroupRows(sampleWorkbook());
  if (!commit) return { preview, committed: false };
  if (preview.issues.length) {
    return updateStore((store) => {
      store.history.push({ id: randomUUID(), groupId: null, at: civilToday(ZONE), text: "Import preview kept the batch in review because rows failed validation." });
      return { preview, committed: false };
    });
  }
  return { preview, committed: false };
}

export function publishEdition(actor: Actor | null) {
  const current = requireActor(actor);
  requirePublisher(current);
  return updateStore((store) => {
    store.edition.assets = [];
    store.edition.status = "published";
    const stamp = civilToday(ZONE).replace(/-/g, ".");
    store.edition.version = `${stamp}-fixture`;
    store.history.push({ id: randomUUID(), groupId: null, at: civilToday(ZONE), text: `Edition ${store.edition.version} marked ready. Files regenerate together on download.` });
    return { version: store.edition.version, status: store.edition.status };
  });
}

export function devReset() {
  if (process.env.NODE_ENV === "production") throw new ApiError(404, "not_found", "Not available.");
  resetStore();
  return { ok: true };
}

export function buyerGroups(store = readStore()): GroupListing[] {
  return published(store);
}

function published(store: Store): GroupListing[] {
  return store.groups.filter((group) => group.listingStatus === "published");
}

function toPlanDraft(item: PlanItem): PlanDraft {
  return { groupId: item.groupId, windowId: item.windowId, date: item.date, status: item.status, kind: item.kind };
}

function toWindow(window: GroupListing["windows"][number]): WindowDto {
  return {
    id: window.id,
    weekdays: window.weekdays,
    startLocal: window.startLocal,
    endLocal: window.endLocal,
    timeLabel: timeLabel(window.startLocal, window.endLocal),
    conditions: window.conditions,
    maxPerWeek: window.maxPerWeek,
  };
}

function toGroup(store: Store, group: GroupListing, businessId: string | null, sample: boolean): GroupCardDto {
  const favorite = businessId ? store.favorites.some((item) => item.businessId === businessId && item.groupId === group.id) : false;
  return {
    id: group.id,
    name: group.name,
    city: group.city,
    county: group.county,
    url: sample ? "" : group.url,
    locality: group.locality,
    distanceLabel: distanceLabel(group.distanceMiles),
    memberCount: group.memberCount,
    countCheckedOn: group.countCheckedOn,
    countProvenance: group.countProvenance,
    privacy: group.privacy,
    joinAccess: group.joinAccess,
    promotionStatus: group.promotionStatus,
    statusLabel: statusLabel(group.promotionStatus),
    ruleSummary: group.ruleSummary,
    categories: group.categories,
    audience: group.audience,
    evidenceDate: group.evidenceDate,
    evidenceSummary: group.evidenceSummary,
    confidence: group.confidence,
    windows: group.windows.map(toWindow),
    correction: group.correction,
    favorite,
    sample,
    fixture: group.fixture,
  };
}

function toPlanItem(store: Store, item: PlanItem): PlanItemDto {
  const group = store.groups.find((entry) => entry.id === item.groupId);
  const draft = store.drafts.filter((entry) => entry.planItemId === item.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const eligibility = group ? assessEligibility(group, item.date) : null;
  const window = group?.windows.find((entry) => entry.id === item.windowId);
  let conditions = window?.conditions || "";
  if (item.kind === "verified" && eligibility && !eligibility.ok && eligibility.code !== "needs_confirmation") {
    conditions = eligibility.message;
  }
  return {
    id: item.id,
    revision: item.revision,
    date: item.date,
    timeLabel: timeLabel(item.startLocal, item.endLocal),
    kind: item.kind,
    kindLabel: item.kind === "verified" ? "Verified slot" : "Personal reminder",
    status: item.status,
    groupId: item.groupId,
    groupName: group?.name ?? "Saved group",
    groupUrl: group?.url ?? "",
    promotionStatus: group?.promotionStatus ?? "unknown",
    statusLabel: item.kind === "personal_reminder" ? "Personal reminder" : statusLabel(group?.promotionStatus ?? "unknown"),
    conditions,
    notes: item.notes,
    draftId: draft?.id ?? null,
    city: group?.city ?? "",
    distanceLabel: distanceLabel(group?.distanceMiles ?? null),
  };
}

function toOpportunity(opportunity: ReturnType<typeof opportunitiesForDate>[number]): OpportunityDto {
  return {
    groupId: opportunity.group.id,
    groupName: opportunity.group.name,
    windowId: opportunity.window.id,
    date: opportunity.date,
    timeLabel: opportunity.timeLabel,
    promotionStatus: opportunity.group.promotionStatus,
    statusLabel: statusLabel(opportunity.group.promotionStatus),
    conditions: opportunity.window.conditions,
    city: opportunity.group.city,
    distanceLabel: distanceLabel(opportunity.group.distanceMiles),
    needsConfirmation: opportunity.group.promotionStatus === "restricted",
  };
}

function toOrder(store: Store, order: Store["orders"][number]): OrderDto {
  return {
    id: order.id,
    status: order.status,
    amountLabel: money(order.amountCents, order.currency),
    offerName: store.offer.name,
    mode: order.mode,
    createdAt: order.createdAt,
  };
}

function assetList(): AssetDto[] {
  return [
    { id: "directory-pdf", label: "Directory PDF", kind: "pdf", ready: true },
    { id: "directory-xlsx", label: "Directory spreadsheet", kind: "xlsx", ready: true },
    { id: "calendar-pdf", label: "Weekly calendar", kind: "pdf", ready: true },
  ];
}

export function markersFor(date: string): { holiday: string | null; campaign: string | null } {
  const year = Number(date.slice(0, 4));
  const thanksgiving = nthWeekday(year, 11, 4, 4);
  if (date === thanksgiving) return { holiday: "Thanksgiving", campaign: null };
  if (date === addDays(thanksgiving, 2)) return { holiday: null, campaign: "Small Business Saturday" };
  if (date.endsWith("-12-25")) return { holiday: "Christmas", campaign: null };
  if (date.endsWith("-01-01")) return { holiday: "New Year's Day", campaign: null };
  if (date.endsWith("-07-04")) return { holiday: "Independence Day", campaign: null };
  return { holiday: null, campaign: null };
}

function nthWeekday(year: number, month: number, weekday: number, nth: number): string {
  let cursor = `${year}-${String(month).padStart(2, "0")}-01`;
  let seen = 0;
  for (let guard = 0; guard < 40; guard += 1) {
    if (civilWeekday(cursor) === weekday) {
      seen += 1;
      if (seen === nth) return cursor;
    }
    cursor = addDays(cursor, 1);
  }
  return cursor;
}

function sampleWorkbook(): WorkbookRow[] {
  return [
    { rowNumber: 5, name: "", urlText: "" },
    {
      rowNumber: 6,
      name: "Magnolia Community Businesses",
      urlText: "https://facebook.com/groups/example",
      linkTarget: "https://example.com/not-facebook",
      promotion: "Yes",
      memberCount: "15400",
      zip: "77354",
    },
    {
      rowNumber: 7,
      name: "Klein Makers",
      urlText: "https://facebook.com/groups/klein",
      linkTarget: "https://facebook.com/groups/klein",
      promotion: "Yes",
      memberCount: "640",
      zip: "77379",
    },
  ];
}

export function monthGrid(month: string) {
  const days = daysInMonth(month);
  const lead = civilWeekday(days[0]);
  const offset = lead === 0 ? 6 : lead - 1;
  return { days, offset, label: formatCivilDate(days[0], false).replace(/ \d+,/, "") };
}

export function calendarRange(view: string, anchor: string) {
  if (view === "week") {
    const start = startOfWeekMonday(anchor);
    return { from: start, to: addDays(start, 6) };
  }
  if (view === "year") {
    const year = anchor.slice(0, 4);
    return { from: `${year}-01-01`, to: `${year}-12-31` };
  }
  const month = monthKey(anchor);
  const days = daysInMonth(month);
  return { from: days[0], to: days[days.length - 1] };
}

export function fulfillStripeSession(input: {
  eventId: string;
  orderId: string | null;
  amountTotal: number | null;
  currency: string | null;
  paymentStatus: string;
}) {
  if (!input.orderId) throw new ApiError(422, "invalid_input", "The Stripe session has no order reference.");
  return updateStore((store) => {
    if (store.stripeEventIds.includes(input.eventId)) return { duplicate: true, granted: false };
    store.stripeEventIds.push(input.eventId);
    const order = store.orders.find((item) => item.id === input.orderId);
    if (!order || order.mode !== "stripe") return { duplicate: false, granted: false };
    const amountMatches = input.amountTotal === order.amountCents && input.currency?.toLowerCase() === order.currency;
    if (input.paymentStatus !== "paid" || !amountMatches) return { duplicate: false, granted: false };
    if (order.status !== "paid") order.status = "paid";
    const existing = store.entitlements.find((item) => item.orderId === order.id);
    if (!existing) {
      store.entitlements.push({ id: randomUUID(), userId: order.userId, editionId: store.edition.id, orderId: order.id, status: "active" });
    }
    return { duplicate: false, granted: true };
  });
}

export function sellingMode(): "demo" | "locked" {
  if (process.env.SELLING_ENABLED === "true") return "locked";
  return "demo";
}

export function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export { formatCivilDate, themeForDate, civilToday, weekDates, weekdayShort };
