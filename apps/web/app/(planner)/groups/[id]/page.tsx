import Link from "next/link";
import { notFound } from "next/navigation";
import { addDays, assessEligibility, civilToday, civilWeekday, formatCivilDate } from "@marketmap/domain";
import { AddSlot, CorrectionForm, FavoriteButton } from "@/components/actions";
import { Pill, members } from "@/components/ui";
import { currentActor } from "@/lib/current";
import { getGroup } from "@/lib/services";
import { ApiError } from "@/lib/errors";
import { readStore } from "@/lib/store";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = readStore().groups.find((item) => item.id === id);
  return { title: group?.name ?? "Group" };
}

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await currentActor();
  let group;
  try {
    group = getGroup(actor, id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const source = readStore().groups.find((item) => item.id === id)!;
  const today = civilToday(actor?.business?.timeZone ?? "America/Chicago");
  const eligibility = assessEligibility(source, today);
  return (
    <div className="stack" style={{ gap: 18 }}>
      <p className="meta"><Link href="/groups">Facebook groups</Link> · {group.fixture ? "Fixture listing" : "Listing"}</p>
      <div className="split-line">
        <h1 className="display" style={{ fontSize: "clamp(40px, 6vw, 64px)", maxWidth: "16ch" }}>{group.name}</h1>
        <Pill status={group.promotionStatus}>{group.statusLabel}</Pill>
      </div>
      <p className="lede">{group.ruleSummary}</p>
      {group.correction ? <p className="notice">{group.correction}</p> : null}
      <div className="grid-2">
        <section className="card flat stack">
          <h2>Access</h2>
          <p>{label(group.privacy)} group · {label(group.joinAccess)}</p>
          <p>{group.city}, {group.county} · {group.distanceLabel}</p>
          <p>{members(group.memberCount)}{group.countCheckedOn ? ` · counted ${group.countCheckedOn}` : ""} · {group.countProvenance ?? "Provenance unknown"}</p>
          <p>Evidence {group.evidenceDate ? formatCivilDate(group.evidenceDate, false) : "Unknown"} · {group.confidence} confidence</p>
          <p>{group.evidenceSummary}</p>
          <div className="btn-row">
            {group.url ? <a className="btn primary" href={group.url} target="_blank" rel="noreferrer">Open group</a> : <span className="meta">The direct link is part of the paid edition.</span>}
            {actor?.entitled ? <FavoriteButton groupId={group.id} favorite={group.favorite} /> : null}
          </div>
        </section>
        <section className="stack">
          <h2 className="serif">Eligible windows</h2>
          {group.windows.length === 0 ? <div className="empty">No determinable window. This cannot become a verified slot.</div> : null}
          {group.windows.map((window) => {
            const date = nextMatching(today, window.weekdays);
            return (
              <article key={window.id} className="card">
                <p className="eyebrow">{window.timeLabel}</p>
                <h3>{formatCivilDate(date)}</h3>
                <p>{window.conditions}</p>
                {!eligibility.ok && eligibility.code !== "needs_confirmation" ? <p className="meta">{eligibility.message}</p> : null}
                {actor?.entitled && (eligibility.ok || eligibility.code === "needs_confirmation") ? (
                  <AddSlot groupId={group.id} windowId={window.id} date={date} restricted={group.promotionStatus === "restricted"} />
                ) : null}
              </article>
            );
          })}
        </section>
      </div>
      <section className="card flat">
        <h2>Change history</h2>
        {group.history.length === 0 ? <p className="muted">No buyer-visible changes yet.</p> : (
          <ul>{group.history.map((item) => <li key={item.at + item.text}>{formatCivilDate(item.at, false)} — {item.text}</li>)}</ul>
        )}
      </section>
      <CorrectionForm groupId={group.id} />
    </div>
  );
}

function nextMatching(from: string, weekdays: number[]): string {
  for (let offset = 0; offset < 14; offset += 1) {
    const date = addDays(from, offset);
    if (weekdays.includes(civilWeekday(date))) return date;
  }
  return from;
}

function label(value: string): string {
  return value.replaceAll("_", " ").replace(/^\w/, (char) => char.toUpperCase());
}
