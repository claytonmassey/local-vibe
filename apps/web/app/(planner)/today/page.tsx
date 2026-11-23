import Link from "next/link";
import { addDays, formatCivilDate } from "@marketmap/domain";
import { AddSlot, PlanButtons, ReminderForm } from "@/components/actions";
import { Pill } from "@/components/ui";
import { currentActor } from "@/lib/current";
import { getHome, getOpportunities } from "@/lib/services";

export const metadata = { title: "Today" };

export default async function TodayPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date } = await searchParams;
  const actor = await currentActor();
  const home = getHome(actor!, date);
  const suggestions = actor?.entitled ? getOpportunities(actor, home.today).items : [];
  const prev = addDays(home.today, -1);
  const next = addDays(home.today, 1);
  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="split-line">
        <div>
          <p className="eyebrow">Today’s marketing plan</p>
          <h1 className="display" style={{ fontSize: "clamp(36px, 5vw, 56px)" }}>{formatCivilDate(home.today)}</h1>
        </div>
        <div className="btn-row no-print">
          <Link className="btn ghost" href={`/today?date=${prev}`} aria-label="Previous day">Previous</Link>
          <Link className="btn ghost" href={`/today?date=${next}`} aria-label="Next day">Next</Link>
        </div>
      </div>
      <section className="theme-band">
        <p className="eyebrow" style={{ color: "#e7d7b2" }}>Focus</p>
        <h2>{home.theme.name}</h2>
        <p>{home.theme.prompt}</p>
      </section>
      <section className="stack">
        <h2 className="serif">Planned</h2>
        {home.plan.length === 0 ? <div className="empty">No planned posts on this date. Suggestions stay separate until you add one.</div> : null}
        {home.plan.map((item) => (
          <article key={item.id} className="card item">
            <header>
              <div>
                <p className="meta">{item.timeLabel} · {item.distanceLabel}</p>
                <h3><Link href={`/groups/${item.groupId}`}>{item.groupName}</Link></h3>
              </div>
              <Pill status={item.kind === "personal_reminder" ? "neutral" : item.promotionStatus}>{item.kindLabel}</Pill>
            </header>
            <p>{item.conditions}</p>
            {item.notes ? <p className="meta">Note: {item.notes}</p> : null}
            <div className="btn-row">
              <PlanButtons item={item} />
              {item.groupUrl ? <a className="btn ghost" href={item.groupUrl} target="_blank" rel="noreferrer">Open group</a> : null}
            </div>
          </article>
        ))}
      </section>
      <section className="stack">
        <h2 className="serif">Suggestions</h2>
        {!actor?.entitled ? <div className="empty">Verified suggestions unlock with the edition. <Link href="/library">Go to the library</Link></div> : null}
        {actor?.entitled && suggestions.length === 0 ? <p className="muted">No eligible window on this date. Restricted and stale groups stay out until they qualify.</p> : null}
        {suggestions.map((item) => (
          <article key={`${item.groupId}-${item.windowId}`} className="card flat item">
            <header>
              <div>
                <p className="meta">{item.timeLabel} · {item.city} · {item.distanceLabel}</p>
                <h3><Link href={`/groups/${item.groupId}`}>{item.groupName}</Link></h3>
              </div>
              <Pill status={item.promotionStatus}>{item.statusLabel}</Pill>
            </header>
            <p>{item.conditions}</p>
            <AddSlot groupId={item.groupId} windowId={item.windowId} date={item.date} restricted={item.needsConfirmation} />
          </article>
        ))}
      </section>
      {actor?.business ? (
        <section className="card flat">
          <ReminderForm date={home.today} groupId="grp_magnolia" />
        </section>
      ) : null}
    </div>
  );
}
