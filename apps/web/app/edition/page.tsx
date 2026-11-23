import Link from "next/link";
import { Logo } from "@/components/logo";
import { Pill, members } from "@/components/ui";
import { catalog, matchQuery } from "@/lib/services";

export const metadata = { title: "Greater Magnolia" };

export default async function EditionPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const { edition, sample } = catalog();
  const match = q ? matchQuery(q) : null;
  return (
    <div className="site-wrap">
      <header className="site-header">
        <Link href="/"><Logo /></Link>
        <Link className="btn primary" href="/sign-in">Create account</Link>
      </header>
      <main>
        <p className="eyebrow">Edition {edition.version}</p>
        <h1 className="display" style={{ fontSize: "clamp(46px, 7vw, 76px)", maxWidth: "12ch" }}>{edition.name}</h1>
        <p className="lede">{edition.summary}</p>
        <form className="filters" action="/edition" style={{ maxWidth: 720 }}>
          <label className="field"><span>ZIP or town</span><input name="q" defaultValue={q} placeholder="77354 or Magnolia" /></label>
          <button className="btn primary">Look up</button>
        </form>
        {match ? <p className={match.matched ? "notice info" : "notice"} role="status">{match.reason}</p> : null}
        <div className="grid-2" style={{ marginTop: 22 }}>
          <section className="card flat">
            <h2>Coverage</h2>
            <p className="eyebrow">Core</p>
            <div className="towns">{edition.coverage.map((town) => <span key={town}>{town}</span>)}</div>
            <p className="eyebrow" style={{ marginTop: 16 }}>Edge, checked before inclusion</p>
            <div className="towns">{edition.edge.map((town) => <span key={town}>{town}</span>)}</div>
            <p className="meta">Distance is a straight line from the {edition.anchorZip} centroid until a method is approved. Unknown stays unknown.</p>
          </section>
          <section className="card">
            <p className="eyebrow">Founding price</p>
            <h2 style={{ fontSize: 48 }}>{edition.priceLabel}</h2>
            <ul>
              {edition.includes.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <p>{edition.updateSummary}</p>
            <p>{edition.refundSummary}</p>
            <p className="meta">Stripe is not connected yet, so checkout unlocks the edition without a charge. Support {edition.supportEmail}</p>
            <Link className="btn primary" href="/sign-in">Create an account</Link>
          </section>
        </div>
        <section style={{ marginTop: 28 }}>
          <h2 className="serif" style={{ fontSize: 32 }}>A safe sample</h2>
          <div className="stack">
            {sample.map((group) => (
              <article key={group.id} className="card flat">
                <div className="split-line">
                  <h3>{group.name}</h3>
                  <Pill status={group.promotionStatus}>{group.statusLabel}</Pill>
                </div>
                <p className="meta">{group.city} · {group.distanceLabel} · {members(group.memberCount)}</p>
                <p>{group.ruleSummary}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
