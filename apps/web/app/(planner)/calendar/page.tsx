import Link from "next/link";
import { addDays, civilToday, daysInMonth, formatCivilDate, monthKey, themeForDate, weekdayShort } from "@marketmap/domain";
import { currentActor } from "@/lib/current";
import { calendarRange, getCalendar, getPlan, monthGrid } from "@/lib/services";

export const metadata = { title: "Calendar" };

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ view?: string; date?: string }> }) {
  const params = await searchParams;
  const actor = await currentActor();
  const zone = actor?.business?.timeZone ?? "America/Chicago";
  const anchor = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : civilToday(zone);
  const view = params.view === "week" || params.view === "year" ? params.view : "month";
  const range = calendarRange(view, anchor);
  const calendar = getCalendar(actor, range.from, range.to);
  const byDate = new Map(calendar.days.map((day) => [day.date, day]));
  const prev = shift(anchor, view, -1);
  const next = shift(anchor, view, 1);
  const title = view === "year" ? anchor.slice(0, 4) : view === "week" ? `Week of ${formatCivilDate(range.from, false)}` : monthGrid(monthKey(anchor)).label;
  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="calendar-head">
        <div>
          <p className="eyebrow">Marketing calendar</p>
          <h1 className="display" style={{ fontSize: "clamp(40px, 5vw, 60px)" }}>{title}</h1>
        </div>
        <div className="btn-row">
          <Link className="btn ghost" href={`/calendar?view=${view}&date=${prev}`}>Previous</Link>
          <Link className="btn ghost" href={`/calendar?view=${view}&date=${next}`}>Next</Link>
        </div>
      </div>
      <div className="chips">
        {(["month", "week", "year"] as const).map((item) => (
          <Link key={item} href={`/calendar?view=${item}&date=${anchor}`} aria-current={view === item ? "page" : undefined}>{item[0].toUpperCase() + item.slice(1)}</Link>
        ))}
      </div>
      <div className="legend">
        <span><i className="post" style={{ background: "#1e4a37" }} /> Post day</span>
        <span><i className="holiday" style={{ background: "#a67c3d" }} /> Holiday</span>
        <span><i className="campaign" style={{ background: "#8c4638" }} /> Campaign</span>
      </div>
      {view === "month" ? <Month anchor={anchor} byDate={byDate} today={civilToday(zone)} /> : null}
      {view === "week" ? <Week actorReady from={range.from} to={range.to} byDate={byDate} /> : null}
      {view === "year" ? <Year anchor={anchor} byDate={byDate} /> : null}
    </div>
  );
}

function Month({ anchor, byDate, today }: { anchor: string; byDate: Map<string, { posts: number; holiday: string | null; campaign: string | null }>; today: string }) {
  const grid = monthGrid(monthKey(anchor));
  return (
    <div>
      <div className="dow">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="month-grid">
        {Array.from({ length: grid.offset }, (_, index) => <div key={`e${index}`} className="day empty" />)}
        {grid.days.map((date) => {
          const marker = byDate.get(date);
          return (
            <Link key={date} href={`/today?date=${date}`} className={`day ${date === today ? "today" : ""}`}>
              <strong>{Number(date.slice(8))}</strong>
              <span>
                {marker?.posts ? <i className="post" title="Post day" /> : null}
                {marker?.holiday ? <i className="holiday" title={marker.holiday} /> : null}
                {marker?.campaign ? <i className="campaign" title={marker.campaign} /> : null}
              </span>
              {marker?.holiday ? <small>{marker.holiday}</small> : null}
              {marker?.campaign ? <small>{marker.campaign}</small> : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

async function Week({ from, to }: { actorReady?: boolean; from: string; to: string; byDate: Map<string, { theme: string; holiday: string | null; campaign: string | null }> }) {
  const actor = await currentActor();
  const plan = actor?.business ? getPlan(actor, from, to).items : [];
  const days = [];
  for (let date = from; date <= to; date = addDays(date, 1)) days.push(date);
  return (
    <div className="week-board">
      {days.map((date) => (
        <article key={date} className="card flat">
          <p className="eyebrow">{weekdayShort(date)}</p>
          <h2 style={{ fontSize: 22 }}><Link href={`/today?date=${date}`}>{themeForDate(date).name}</Link></h2>
          <p className="meta">{themeForDate(date).prompt}</p>
          {plan.filter((item) => item.date === date).map((item) => (
            <p key={item.id}><strong>{item.timeLabel}</strong><br />{item.groupName}</p>
          ))}
        </article>
      ))}
    </div>
  );
}

function Year({ anchor, byDate }: { anchor: string; byDate: Map<string, { posts: number }> }) {
  const year = anchor.slice(0, 4);
  return (
    <div className="year-grid">
      {Array.from({ length: 12 }, (_, index) => {
        const month = `${year}-${String(index + 1).padStart(2, "0")}`;
        const days = daysInMonth(month);
        const posts = days.reduce((sum, date) => sum + (byDate.get(date)?.posts ?? 0), 0);
        return (
          <Link key={month} className="mini" href={`/calendar?view=month&date=${days[0]}`}>
            <strong className="serif" style={{ fontSize: 24 }}>{monthGrid(month).label.replace(` ${year}`, "")}</strong>
            <p className="meta">{posts === 0 ? "No posts planned" : `${posts} planned`}</p>
          </Link>
        );
      })}
    </div>
  );
}

function shift(anchor: string, view: string, direction: number): string {
  if (view === "year") return `${Number(anchor.slice(0, 4)) + direction}-06-01`;
  if (view === "week") return addDays(anchor, 7 * direction);
  const [year, month] = monthKey(anchor).split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1 + direction, 1));
  return next.toISOString().slice(0, 10);
}
