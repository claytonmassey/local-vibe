import { cookies } from "next/headers";
import { actorFromToken, type Actor } from "./services";

export async function currentActor(): Promise<Actor | null> {
  const jar = await cookies();
  return await actorFromToken(jar.get("mm_session")?.value ?? null);
}

export function destinationFor(actor: Actor): string {
  if (actor.user.role === "admin" || actor.user.role === "publisher") return "/publisher";
  if (!actor.business) return "/onboarding";
  return "/home";
}
