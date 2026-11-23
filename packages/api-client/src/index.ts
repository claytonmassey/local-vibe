import type {
  AssetDto,
  GroupCardDto,
  HomeDto,
  MeDto,
  OpportunityDto,
  OrderDto,
  PlanItemDto,
  SessionDto,
} from "@marketmap/contracts";

export type TokenSource = () => Promise<string | null> | string | null;

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
  }
}

export function createClient(options: { baseUrl: string; getToken?: TokenSource }) {
  const base = options.baseUrl.replace(/\/$/, "");

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = options.getToken ? await options.getToken() : null;
    const headers = new Headers(init.headers);
    if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");
    if (token) headers.set("authorization", `Bearer ${token}`);
    const response = await fetch(`${base}${path}`, { ...init, headers });
    if (response.status === 204) return undefined as T;
    const payload = (await response.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
    if (!response.ok) {
      throw new ApiClientError(payload?.error?.message ?? "Request failed", response.status, payload?.error?.code ?? "request_failed");
    }
    return payload as T;
  }

  return {
    signUp: (body: { name: string; email: string; password: string }) =>
      request<SessionDto>("/api/v1/account", { method: "POST", body: JSON.stringify(body) }),
    signIn: (body: { email: string; password: string }) =>
      request<SessionDto>("/api/v1/session", { method: "POST", body: JSON.stringify(body) }),
    signOut: () => request<void>("/api/v1/session", { method: "DELETE" }),
    me: () => request<MeDto>("/api/v1/me"),
    saveProfile: (body: {
      businessName: string;
      category: string;
      zip: string;
      timeZone: string;
      offerings: string;
      tone: string;
      remindersOptIn?: boolean;
    }) => request<MeDto>("/api/v1/onboarding", { method: "POST", body: JSON.stringify(body) }),
    home: (date?: string) => request<HomeDto>(`/api/v1/home${date ? `?date=${date}` : ""}`),
    groups: (query: Record<string, string | undefined>) => {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) if (value) params.set(key, value);
      const suffix = params.toString();
      return request<{ items: GroupCardDto[]; total: number }>(`/api/v1/editions/founding/groups${suffix ? `?${suffix}` : ""}`);
    },
    group: (id: string) => request<GroupCardDto>(`/api/v1/groups/${id}`),
    opportunities: (date: string) => request<{ items: OpportunityDto[] }>(`/api/v1/opportunities?date=${date}`),
    plan: (from: string, to: string) => request<{ items: PlanItemDto[] }>(`/api/v1/plans?from=${from}&to=${to}`),
    calendar: (from: string, to: string) =>
      request<{
        days: Array<{ date: string; posts: number; holiday: string | null; campaign: string | null }>;
      }>(`/api/v1/calendar?from=${from}&to=${to}`),
    addPlanItem: (body: {
      groupId: string;
      windowId?: string;
      date: string;
      kind?: "verified" | "personal_reminder";
      acknowledgeConditions?: boolean;
      notes?: string;
    }) => request<PlanItemDto>("/api/v1/plan-items", { method: "POST", body: JSON.stringify(body) }),
    patchPlanItem: (id: string, body: { revision: number; status?: "planned" | "done"; notes?: string; date?: string }) =>
      request<PlanItemDto>(`/api/v1/plan-items/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    generateDraft: (body: { date: string; talkingPoints?: string; tone: string; groupId?: string; planItemId?: string }) =>
      request<{ id: string; title: string; body: string; reminders: string[]; revision: number; groupUrl: string | null }>("/api/v1/drafts/generate", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    saveDraft: (id: string, body: { body: string; revision: number }) =>
      request<{ id: string; body: string; revision: number }>(`/api/v1/drafts/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    favorite: (groupId: string) => request<{ favorite: boolean }>("/api/v1/favorites", { method: "POST", body: JSON.stringify({ groupId }) }),
    unfavorite: (groupId: string) => request<void>(`/api/v1/favorites/${groupId}`, { method: "DELETE" }),
    checkout: (offerId: string) => request<{ order: OrderDto; url: string }>("/api/v1/checkout", { method: "POST", body: JSON.stringify({ offerId }) }),
    orders: () => request<{ items: OrderDto[]; assets: AssetDto[] }>("/api/v1/orders"),
    reconcile: (orderId: string) => request<OrderDto>(`/api/v1/orders/${orderId}/reconcile`, { method: "POST" }),
    correct: (groupId: string, message: string) =>
      request<{ id: string }>("/api/v1/corrections", { method: "POST", body: JSON.stringify({ groupId, message }) }),
    catalog: () =>
      request<{
        edition: { id: string; name: string; version: string; publishedOn: string; anchorZip: string; coverage: string[]; edge: string[]; summary: string; priceLabel: string; includes: string[]; supportEmail: string; refundSummary: string; updateSummary: string };
        sample: GroupCardDto[];
      }>("/api/v1/editions"),
  };
}

export type MarketMapClient = ReturnType<typeof createClient>;
