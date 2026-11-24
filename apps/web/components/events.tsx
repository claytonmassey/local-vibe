"use client";

import { useEffect, useState } from "react";
import type { LocalEvent } from "@marketmap/domain";
import { LOCAL_EVENTS } from "@marketmap/domain";
import { IconHeart } from "@/components/icons";

const KEY = "mm_local_events";

type Saved = { favorites: string[]; extra: LocalEvent[] };

function load(): Saved {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "") as Saved;
    return { favorites: parsed.favorites ?? [], extra: parsed.extra ?? [] };
  } catch {
    return { favorites: [], extra: [] };
  }
}

export function EventsBoard() {
  const [tab, setTab] = useState<"upcoming" | "mine">("upcoming");
  const [saved, setSaved] = useState<Saved>({ favorites: [], extra: [] });
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setSaved(load()); }, []);

  function write(next: Saved) {
    setSaved(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  const events = [...LOCAL_EVENTS, ...saved.extra];
  const visible = tab === "mine" ? events.filter((event) => saved.favorites.includes(event.id) || saved.extra.some((item) => item.id === event.id)) : events;

  return (
    <div className="stack">
      <div className="seg" role="tablist">
        <button type="button" className={tab === "upcoming" ? "on" : ""} onClick={() => setTab("upcoming")}>Upcoming Events</button>
        <button type="button" className={tab === "mine" ? "on" : ""} onClick={() => setTab("mine")}>My Events</button>
      </div>
      {visible.length === 0 ? <div className="empty"><p>Save an event with the heart, or submit one below.</p></div> : null}
      {visible.map((event) => {
        const loved = saved.favorites.includes(event.id);
        return (
          <article key={event.id} className="event-row">
            <div className="date-badge"><span>{event.month}</span><strong>{event.day}</strong></div>
            <div>
              <h2 style={{ fontSize: 22, margin: 0 }}>{event.title}</h2>
              <p className="meta">{event.when}</p>
              <p className="meta">{event.place}</p>
            </div>
            <button
              type="button"
              className="heart"
              aria-pressed={loved}
              aria-label={loved ? "Remove from my events" : "Save event"}
              onClick={() => write({ ...saved, favorites: loved ? saved.favorites.filter((id) => id !== event.id) : [...saved.favorites, event.id] })}
            >
              <IconHeart filled={loved} />
            </button>
          </article>
        );
      })}
      <button type="button" className="btn primary" onClick={() => setOpen((value) => !value)}>+ Submit a Local Event</button>
      {open ? (
        <form
          className="card stack"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const title = String(form.get("title") ?? "").trim();
            const when = String(form.get("when") ?? "").trim();
            const place = String(form.get("place") ?? "").trim();
            const date = String(form.get("date") ?? "");
            if (!title || !when || !place || !date) {
              setError("Add a title, date, time and place.");
              return;
            }
            const day = date.slice(8).replace(/^0/, "");
            const month = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][Number(date.slice(5, 7)) - 1] ?? "";
            const next: LocalEvent = { id: `evt_${Date.now()}`, month, day, date, title, when, place };
            write({ favorites: [...saved.favorites, next.id], extra: [...saved.extra, next] });
            setTab("mine");
            setOpen(false);
            setError(null);
          }}
        >
          <label className="field"><span>Event name</span><input name="title" required /></label>
          <label className="field"><span>Date</span><input name="date" type="date" required /></label>
          <label className="field"><span>Time</span><input name="when" placeholder="Thu, Dec 4 · 5:30 PM – 7:00 PM" required /></label>
          <label className="field"><span>Place</span><input name="place" required /></label>
          {error ? <p className="error" role="alert">{error}</p> : null}
          <button className="btn primary" type="submit">Save event</button>
        </form>
      ) : null}
    </div>
  );
}
