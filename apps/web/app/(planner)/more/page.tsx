import Link from "next/link";
import { OnboardingForm, SignOutButton } from "@/components/actions";
import { currentActor } from "@/lib/current";
import { catalog, getMe } from "@/lib/services";

export const metadata = { title: "More" };

export default async function MorePage() {
  const actor = await currentActor();
  const me = getMe(actor);
  const { edition } = catalog();
  return (
    <div className="stack" style={{ gap: 18, maxWidth: 820 }}>
      <header>
        <p className="eyebrow">More</p>
        <h1 className="display" style={{ fontSize: "clamp(40px, 6vw, 64px)" }}>{me.user.name}</h1>
        <p className="muted">{me.user.email} · {me.user.role}</p>
      </header>
      <section className="card flat">
        <h2>Edition</h2>
        <p>{me.entitled ? `${edition.name} is on this account.` : "No paid edition yet."}</p>
        <Link href="/library">Open the library</Link>
      </section>
      <section>
        <h2 className="serif">Business profile</h2>
        {me.business ? <OnboardingForm initial={{ ...me.business, businessName: me.business.name }} /> : <Link href="/onboarding">Add your business</Link>}
      </section>
      <section className="card flat">
        <h2>Support</h2>
        <p>Corrections from a group page land in the publisher queue. Email {edition.supportEmail}.</p>
        <p className="meta">Native reminders are saved as a preference and are not delivered in this release.</p>
      </section>
      <SignOutButton />
    </div>
  );
}
