import { cookies } from "next/headers";
import { actorFromToken, type Actor } from "./services";

export async function currentActor(): Promise<Actor | null> {
  const jar = await cookies();
  return actorFromToken(jar.get("mm_session")?.value ?? null);
}
