import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import {
  addPlanBody,
  checkoutBody,
  correctionBody,
  favoriteBody,
  generateDraftBody,
  onboardingBody,
  patchDraftBody,
  patchPlanBody,
  signInBody,
  signUpBody,
} from "@marketmap/contracts";
import { downloadAsset } from "@/lib/exports";
import { jsonError, ApiError } from "@/lib/errors";
import {
  actorFromToken,
  adminQueue,
  commitImport,
  createCheckout,
  createPlanItem,
  devReset,
  catalog,
  generateDraft,
  getCalendar,
  getGroup,
  getHome,
  getMe,
  getOpportunities,
  getPlan,
  listGroups,
  listOrders,
  latestDraft,
  matchQuery,
  patchDraft,
  patchPlanItem,
  publishEdition,
  reconcileOrder,
  refundOrder,
  saveBusiness,
  setFavorite,
  signIn,
  signOut,
  signUp,
  submitCorrection,
} from "@/lib/services";
import { ZodError } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ path: string[] }> };

async function handle(req: Request, context: Ctx): Promise<Response> {
  const requestId = randomUUID();
  if (req.method === "OPTIONS") return withMeta(new Response(null, { status: 204 }), requestId);
  try {
    const { path } = await context.params;
    const response = await dispatch(req, path);
    return withMeta(response, requestId);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message ?? "Check the form and try again.";
      return withMeta(jsonError(new ApiError(422, "invalid_input", message), requestId), requestId);
    }
    return withMeta(jsonError(error, requestId), requestId);
  }
}

async function dispatch(req: Request, path: string[]): Promise<Response> {
  const key = `${req.method} ${path.join("/")}`;
  const url = new URL(req.url);
  const actor = await actorFromToken(tokenFrom(req));
  const query = Object.fromEntries(url.searchParams.entries());

  if (key === "POST account") {
    const session = await signUp(signUpBody.parse(await req.json()));
    await remember(session.token);
    return Response.json(session, { status: 201 });
  }
  if (key === "POST session") {
    const session = await signIn(signInBody.parse(await req.json()));
    await remember(session.token);
    return Response.json(session);
  }
  if (key === "DELETE session") {
    await signOut(tokenFrom(req));
    await remember(null);
    return new Response(null, { status: 204 });
  }
  if (key === "GET me") return Response.json(getMe(actor));
  if (key === "POST onboarding") return Response.json(await saveBusiness(actor, onboardingBody.parse(await req.json())));
  if (key === "GET editions") return Response.json({ ...catalog(), match: query.q ? matchQuery(query.q) : null });
  if (key === "GET home") return Response.json(getHome(actor, query.date));
  if (key === "GET editions/founding/groups" || (path[0] === "editions" && path[2] === "groups" && req.method === "GET")) {
    return Response.json(listGroups(actor, query));
  }
  if (path[0] === "groups" && path[1] && req.method === "GET") return Response.json(getGroup(actor, path[1]));
  if (key === "GET calendar") return Response.json(getCalendar(actor, query.from, query.to));
  if (key === "GET opportunities") return Response.json(getOpportunities(actor, query.date));
  if (key === "GET plans") return Response.json(getPlan(actor, query.from, query.to));
  if (key === "POST plan-items") return Response.json(createPlanItem(actor, addPlanBody.parse(await req.json())), { status: 201 });
  if (path[0] === "plan-items" && path[1] && req.method === "PATCH") {
    return Response.json(patchPlanItem(actor, path[1], patchPlanBody.parse(await req.json())));
  }
  if (key === "POST drafts/generate") return Response.json(generateDraft(actor, generateDraftBody.parse(await req.json())), { status: 201 });
  if (key === "GET drafts") return Response.json(latestDraft(actor, query.date));
  if (path[0] === "drafts" && path[1] && req.method === "PATCH") {
    return Response.json(patchDraft(actor, path[1], patchDraftBody.parse(await req.json())));
  }
  if (key === "POST favorites") {
    const body = favoriteBody.parse(await req.json());
    return Response.json(setFavorite(actor, body.groupId, true));
  }
  if (path[0] === "favorites" && path[1] && req.method === "DELETE") return Response.json(setFavorite(actor, path[1], false));
  if (key === "POST checkout") {
    checkoutBody.parse(await req.json());
    return Response.json(createCheckout(actor), { status: 201 });
  }
  if (key === "GET orders") return Response.json(listOrders(actor));
  if (path[0] === "orders" && path[2] === "reconcile" && req.method === "POST") return Response.json(reconcileOrder(actor, path[1]));
  if (path[0] === "orders" && path[2] === "refund" && req.method === "POST") return Response.json(refundOrder(actor, path[1]));
  if (key === "POST corrections") {
    const body = correctionBody.parse(await req.json());
    return Response.json(submitCorrection(actor, body.groupId, body.message), { status: 201 });
  }
  if (key === "GET admin/queue") return Response.json(adminQueue(actor));
  if (key === "POST admin/imports") {
    const body = (await req.json().catch(() => ({}))) as { commit?: boolean };
    return Response.json(commitImport(actor, Boolean(body.commit)));
  }
  if (path[0] === "admin" && path[1] === "editions" && path[3] === "publish" && req.method === "POST") {
    return Response.json(publishEdition(actor));
  }
  if (path[0] === "editions" && path[2] === "downloads" && path[3] && req.method === "GET") {
    const file = await downloadAsset(actor, path[3]);
    return new Response(Buffer.from(file.bytes), {
      headers: {
        "content-type": file.contentType,
        "content-disposition": `attachment; filename="${file.filename}"`,
        "cache-control": "private, no-store",
      },
    });
  }
  if (key === "POST dev/reset") return Response.json(devReset());
  throw new ApiError(404, "not_found", "That route is not part of the founding API.");
}

function tokenFrom(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) return header.slice(7).trim();
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|; )mm_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function remember(token: string | null) {
  const jar = await cookies();
  jar.set("mm_session", token ?? "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: token ? 60 * 60 * 24 * 30 : 0,
    secure: process.env.NODE_ENV === "production",
  });
}

function withMeta(response: Response, requestId: string): Response {
  const headers = new Headers(response.headers);
  for (const cookie of response.headers.getSetCookie()) headers.append("set-cookie", cookie);
  headers.set("x-request-id", requestId);
  headers.set("access-control-allow-origin", process.env.CORS_ORIGIN ?? "*");
  headers.set("access-control-allow-headers", "authorization, content-type");
  headers.set("access-control-allow-methods", "GET,POST,PATCH,DELETE,OPTIONS");
  headers.set("cache-control", headers.get("cache-control") ?? "private, no-store");
  return new Response(response.body, { status: response.status, headers });
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
