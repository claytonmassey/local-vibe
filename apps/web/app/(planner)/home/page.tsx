import Link from "next/link";
import { formatCivilDate } from "@marketmap/domain";
import { PlanButtons } from "@/components/actions";
import { Pill } from "@/components/ui";
import { currentActor } from "@/lib/current";
import { getHome } from "@/lib/services";

export const metadata = { title: "Home" };

export default async function HomePage() {
  const actor = await currentActor();
  const home = getHome(actor!);
  return (
    <div className="stack" style={{ gap: 22 }}>
      <header>
        <p className="eyebrow">{home.edition ? `${home.edition.name} · ${home.edition.version}` : "Preview"}</p>
        <h1 className="display" style={{ fontSize: "clamp(42px, 6vw, 68px)" }}>{home.greeting}, {home.displayName}.</h1>
        <p className="lede">{home.businessName ? `${home.businessName} · ${formatCivilDate(home.today)}` : "Your business profile is the source for every draft."}</p>
      </header>
      {home.notices.map((notice) => (
        <p key={notice.id} className={notice.tone === "warning" ? "notice" : "notice info"}>
          {notice.text} <Link href={notice.href}>Open</Link>
        </p>
      ))}
      <section className="theme-band">
        <p className="eyebrow" style={{ color: "#e7d7b2" }}>Today’s plan</p>
        <h2>{home.theme.name}</h2>
        <p>{home.theme.prompt}</p>
        <div className="btn-row" style={{ marginTop: 16, position: "relative" }}>
          <Link className="btn primary" href={`/today?date=${home.today}`}>Open the day</Link>
          <Link className="btn ghost" href={`/studio?date=${home.today}`}>Draft this theme</Link>
        </div>
      </section>
      <section className="discover">
        <Link href="/calendar"><strong>Year at a Glance</strong><span>Holidays, campaigns and the month’s marketing themes.</span></Link>
        <Link href="/events"><strong>Networking & Events</strong><span>Local meetings, mixers and vendor markets.</span></Link>
        <Link href="/groups"><strong>Facebook groups</strong><span>Find local groups and the rules for a promo post.</span></Link>
      </section>
      <section className="stats grid-3">
        <Link href={`/today?date=${home.today}`}><strong>{home.counts.groups}</strong><span>Groups in today’s plan</span></Link>
        <Link href="/studio"><strong>{home.counts.drafts}</strong><span>Ready drafts</span></Link>
        <Link href="/calendar?view=week"><strong>{home.counts.tasks}</strong><span>Open tasks this week</span></Link>
      </section>
      <section>
        <div className="split-line"><h2 className="serif" style={{ fontSize: 28 }}>This week</h2><Link href="/calendar?view=week">Week view</Link></div>
        <div className="week" style={{ marginTop: 10 }}>
          {home.week.map((day) => (
            <Link key={day.date} href={`/today?date=${day.date}`} className={`${day.active ? "active" : ""} ${day.hasPlan ? "marked" : ""}`}>
              <small>{day.weekdayShort}</small>
              <strong>{day.dayNumber}</strong>
              <em>{day.theme.replace(/ (Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/, "")}</em>
            </Link>
          ))}
        </div>
      </section>
      <section className="stack">
        <h2 className="serif" style={{ fontSize: 28 }}>On the plan</h2>
        {home.plan.length === 0 ? <div className="empty"><p>Nothing is scheduled today. Open the day to add a suggestion or a personal reminder.</p></div> : home.plan.map((item) => (
          <article key={item.id} className="card flat item">
            <header>
              <div>
                <p className="meta">{item.timeLabel} · {item.city}</p>
                <h3><Link href={`/groups/${item.groupId}`}>{item.groupName}</Link></h3>
              </div>
              <Pill status={item.kind === "personal_reminder" ? "neutral" : item.promotionStatus}>{item.statusLabel}</Pill>
            </header>
            <p>{item.conditions}</p>
            <PlanButtons item={item} />
          </article>
        ))}
      </section>
    </div>
  );
}
