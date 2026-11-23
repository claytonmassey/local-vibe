import { redirect } from "next/navigation";
import { currentActor } from "@/lib/current";
import { adminQueue } from "@/lib/services";
import { PublisherActions } from "@/components/publisher";

export const metadata = { title: "Publisher" };

export default async function PublisherPage() {
  const actor = await currentActor();
  if (!actor || (actor.user.role !== "admin" && actor.user.role !== "publisher")) redirect("/home");
  const queue = adminQueue(actor);
  return (
    <div className="stack" style={{ gap: 18 }}>
      <header>
        <p className="eyebrow">Publisher · fixture data is separate from real research</p>
        <h1 className="display" style={{ fontSize: "clamp(40px, 6vw, 64px)" }}>{queue.edition.name}</h1>
        <p className="lede">Version {queue.edition.version} · {queue.edition.status}. Files are generated from this snapshot and refused if they drift.</p>
      </header>
      <PublisherActions />
      <section className="stack">
        <h2 className="serif">Review queue</h2>
        {queue.queue.map((item) => (
          <article key={item.id} className="card flat split-line">
            <div>
              <strong>{item.name}</strong>
              <p className="meta">{item.city}</p>
            </div>
            <span className="pill unknown">{item.reason}</span>
          </article>
        ))}
      </section>
      <section className="card flat">
        <h2>Workbook preview</h2>
        <p>{queue.preview.accepted} rows could be staged. {queue.preview.skipped} blank rows skipped. Nothing publishes from a failed preview.</p>
        <ul>
          {queue.preview.issues.map((issue) => <li key={`${issue.row}${issue.code}`}>Row {issue.row} · {issue.field} · {issue.message}</li>)}
        </ul>
      </section>
      <section>
        <h2 className="serif">Open corrections</h2>
        {queue.corrections.length === 0 ? <p className="muted">No buyer corrections waiting.</p> : queue.corrections.map((item) => (
          <p key={item.id}>{item.message}</p>
        ))}
      </section>
      <section>
        <h2 className="serif">Edition log</h2>
        <ul>{queue.history.map((item) => <li key={item.id}>{item.at} — {item.text}</li>)}</ul>
      </section>
    </div>
  );
}
