import { EventsBoard } from "@/components/events";

export const metadata = { title: "Networking & Events" };

export default function EventsPage() {
  return (
    <div className="stack" style={{ gap: 18, maxWidth: 760 }}>
      <header>
        <p className="eyebrow">🤝 Networking</p>
        <h1 className="display" style={{ fontSize: "clamp(40px, 6vw, 64px)" }}>Networking & Events</h1>
        <p className="lede">Local meetings, mixers and vendor opportunities.</p>
        <p className="meta">Sample listings around Magnolia. These are fixture events, not a live feed.</p>
      </header>
      <EventsBoard />
    </div>
  );
}
