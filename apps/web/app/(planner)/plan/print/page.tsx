import { civilToday, formatCivilDate, weekDates } from "@marketmap/domain";
import { currentActor } from "@/lib/current";
import { getPlan } from "@/lib/services";

export const metadata = { title: "Weekly plan" };

export default async function PrintPlanPage() {
  const actor = await currentActor();
  const today = civilToday(actor?.business?.timeZone ?? "America/Chicago");
  const week = weekDates(today);
  const plan = actor?.business ? getPlan(actor, week[0], week[6]).items : [];
  return (
    <article>
      <p className="eyebrow">Personal plan · not an edition file</p>
      <h1 className="display" style={{ fontSize: 48 }}>Week of {formatCivilDate(week[0], false)}</h1>
      <p>{actor?.business?.name}. Posting still happens in Facebook. MarketMap does not post for you.</p>
      <div className="stack">
        {week.map((date) => (
          <section key={date}>
            <h2 className="serif">{formatCivilDate(date)}</h2>
            {plan.filter((item) => item.date === date).length === 0 ? <p className="muted">Nothing planned.</p> : plan.filter((item) => item.date === date).map((item) => (
              <p key={item.id}><strong>{item.timeLabel}</strong> · {item.groupName} · {item.kindLabel}{item.notes ? ` · ${item.notes}` : ""}</p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
