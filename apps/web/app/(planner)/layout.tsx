import { redirect } from "next/navigation";
import { Shell } from "@/components/shell";
import { currentActor } from "@/lib/current";

export const dynamic = "force-dynamic";

export default async function PlannerLayout({ children }: { children: React.ReactNode }) {
  const actor = await currentActor();
  if (!actor) redirect("/sign-in");
  return (
    <Shell name={actor.user.name} business={actor.business?.name ?? "Publisher workspace"} role={actor.user.role}>
      {children}
    </Shell>
  );
}
