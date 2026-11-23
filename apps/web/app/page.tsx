import Link from "next/link";
import { civilToday, themeForDate } from "@marketmap/domain";
import { Logo } from "@/components/logo";
import { catalog } from "@/lib/services";

export default function LandingPage() {
  const { edition, selling } = catalog();
  const today = civilToday("America/Chicago");
  const theme = themeForDate(today);
  return (
    <div className="site-wrap">
      <header className="site-header">
        <Logo />
        <nav className="btn-row">
          <Link href="/edition">The edition</Link>
          <Link className="btn primary" href="/sign-in">Sign in</Link>
        </nav>
      </header>
      <main className="hero">
        <div className="hero-copy">
          <p className="kicker"><i /> Founding edition · ZIP {edition.anchorZip}</p>
          <h1 className="display">Plan the week. Respect the group.</h1>
          <p className="lede">MarketMap is the planner for owners who promote in local Facebook groups the careful way: a researched window, a draft you can edit, and a handoff you finish yourself.</p>
          <div className="btn-row" style={{ marginTop: 22 }}>
            <Link className="btn primary" href="/sign-in">Open the planner</Link>
            <Link className="btn ghost" href="/edition">Find your town</Link>
          </div>
          <p className="meta">Fixture preview around Magnolia, Texas. {selling === "demo" ? "Checkout is a test. Live selling is locked." : "Live selling is locked."}</p>
        </div>
        <article className="card" aria-label="Preview of today’s plan">
          <p className="eyebrow">Today’s rhythm</p>
          <h2 style={{ fontSize: 40 }}>{theme.name}</h2>
          <p>{theme.prompt}</p>
          <div className="stack">
            <div className="split-line"><strong>9–11 AM</strong><span className="pill allowed">Confirmed allowed</span></div>
            <div>
              <strong>Magnolia Community Businesses</strong>
              <p className="meta">Magnolia · 4.2 mi · One promo in the morning window.</p>
            </div>
            <div className="split-line"><span className="pill neutral">Personal reminder</span><span className="meta">Not a verified slot</span></div>
          </div>
        </article>
      </main>
      <section className="steps" style={{ margin: "28px 0 48px" }}>
        {[
          ["01", "Find the edition", "Search by ZIP or town. Core, edge and outside stay labeled."],
          ["02", "Keep the rules visible", "Only current, dated evidence becomes a verified slot."],
          ["03", "Draft, then post yourself", "Copy the words, open Facebook, and mark it done after you post."],
          ["04", "Same plan, either device", "The web app and the Expo app share one account and one week."],
        ].map(([n, title, copy]) => (
          <article key={n}>
            <span className="eyebrow">{n}</span>
            <strong>{title}</strong>
            <p className="muted">{copy}</p>
          </article>
        ))}
      </section>
      <section className="card" style={{ marginBottom: 28 }}>
        <div className="price">
          <div>
            <p className="eyebrow">Included files</p>
            <h2 style={{ fontSize: 36 }}>Directory, spreadsheet, weekly calendar.</h2>
            <div className="towns" style={{ marginTop: 12 }}>
              {edition.coverage.map((town) => <span key={town}>{town}</span>)}
            </div>
          </div>
          <div>
            <b>{edition.priceLabel}</b>
            <p className="meta">Pilot price for the test checkout. Not a live offer.</p>
            <Link className="btn primary" href="/edition">See coverage</Link>
          </div>
        </div>
      </section>
      <footer className="site-footer">
        <span className="muted">Support · support@marketmap.example</span>
        <span className="muted">Posting still happens on Facebook.</span>
      </footer>
    </div>
  );
}
