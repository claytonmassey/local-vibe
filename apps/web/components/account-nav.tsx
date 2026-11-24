import Link from "next/link";
import { currentActor, destinationFor } from "@/lib/current";

export async function AccountNav({ includeEdition = false }: { includeEdition?: boolean }) {
  const actor = await currentActor();
  if (actor) {
    return (
      <nav className="btn-row">
        {includeEdition ? <Link href="/edition">The edition</Link> : null}
        <Link className="btn primary" href={destinationFor(actor)}>Open the planner</Link>
      </nav>
    );
  }
  return (
    <nav className="btn-row">
      {includeEdition ? <Link href="/edition">The edition</Link> : null}
      <Link href="/login">Log in</Link>
      <Link className="btn primary" href="/sign-in">Create account</Link>
    </nav>
  );
}
