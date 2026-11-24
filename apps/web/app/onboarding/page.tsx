import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { OnboardingForm, SignOutButton } from "@/components/actions";
import { currentActor } from "@/lib/current";

export const metadata = { title: "Your business" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const actor = await currentActor();
  if (!actor) redirect("/sign-in");
  return (
    <div className="site-wrap">
      <header className="site-header">
        <Link href="/"><Logo /></Link>
        <div className="btn-row">
          <span className="meta">{actor.user.email}</span>
          <SignOutButton />
        </div>
      </header>
      <main style={{ maxWidth: 760, paddingBottom: 64 }}>
        <p className="eyebrow">Business profile</p>
        <h1 className="display" style={{ fontSize: "clamp(42px, 6vw, 64px)" }}>Tell the planner what is true.</h1>
        <p className="lede">Drafts will only use these details. They will not invent an offer, a testimonial or a result.</p>
        <OnboardingForm
          initial={actor.business ? {
            businessName: actor.business.name,
            category: actor.business.category,
            zip: actor.business.zip,
            timeZone: actor.business.timeZone,
            offerings: actor.business.offerings,
            tone: actor.business.tone,
            remindersOptIn: actor.business.remindersOptIn,
          } : undefined}
        />
      </main>
    </div>
  );
}
