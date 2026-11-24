import Link from "next/link";
import { PlanButtons } from "@/components/actions";
import { IconCheck, IconChevron, IconMegaphone, IconSpark, IconUsers } from "@/components/icons";
import { Pill } from "@/components/ui";
import { currentActor } from "@/lib/current";
import { getHome } from "@/lib/services";

export const metadata = { title: "Home" };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default async function HomePage() {
  const actor = await currentActor();
  const home = getHome(actor!);
  const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date(`${home.today}T12:00:00Z`).getUTCDay()];
  const day = Number(home.today.slice(8));
  const month = MONTHS[Number(home.today.slice(5, 7)) - 1];
  const tasksToday = home.plan.filter((item) => item.status !== "done").length;
  return (
    <div className="hub">
      <header className="hub-hello">
        <span className="avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="28" height="28"><circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M5.5 19.2c1.4-3 3.6-4.4 6.5-4.4s5.1 1.4 6.5 4.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </span>
        <div>
          <h1>Hi {home.displayName}!</h1>
          <p>{home.businessName ? `${home.businessName} · your marketing hub` : "Your business marketing hub"}</p>
        </div>
      </header>

      <Link className="today-row" href={`/today?date=${home.today}`}>
        <span className="today-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="26" height="26"><rect x="4" y="5" width="16" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M8 3.5v3M16 3.5v3M4 10h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </span>
        <span>
          <strong>Today’s Plan</strong>
          <em>{weekday}, {month} {day}</em>
        </span>
        <span className="chev"><IconChevron size={20} /></span>
      </Link>

      <section className="theme-note">
        <span className="glyph"><IconMegaphone size={20} /></span>
        <div>
          <h2>{home.theme.name}</h2>
          <p>{home.theme.prompt}</p>
        </div>
      </section>

      <section className="stat-tiles">
        <Link href={`/today?date=${home.today}`}>
          <span className="glyph"><IconUsers /></span>
          <strong>{home.counts.groups}</strong>
          <em>Groups to post in</em>
        </Link>
        <Link href="/studio">
          <span className="glyph"><IconSpark /></span>
          <strong>{home.counts.drafts}</strong>
          <em>AI post ready</em>
        </Link>
        <Link href={`/today?date=${home.today}`}>
          <span className="glyph"><IconCheck /></span>
          <strong>{tasksToday}</strong>
          <em>Tasks today</em>
        </Link>
      </section>

      <section>
        <h2 className="week-title">This week at a glance</h2>
        <div className="week glance">
          {home.week.map((dayItem) => (
            <Link key={dayItem.date} href={`/today?date=${dayItem.date}`} className={dayItem.active ? "active" : ""}>
              <small>{dayItem.weekdayShort}</small>
              <em>{dayItem.theme}</em>
            </Link>
          ))}
        </div>
      </section>

      {home.notices.filter((notice) => notice.tone === "warning").map((notice) => (
        <p key={notice.id} className="notice">{notice.text} <Link href={notice.href}>Open</Link></p>
      ))}

      <section className="stack">
        {home.plan.length === 0 ? <p className="meta">Nothing is on today’s plan yet. Open the day when you are ready to add a group.</p> : home.plan.map((item) => (
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
