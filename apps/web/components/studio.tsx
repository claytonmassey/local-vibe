"use client";

import { useState } from "react";
import { CopyButton } from "./actions";

type GroupOption = { id: string; name: string };
type Draft = { id: string; title: string; body: string; reminders: string[]; revision: number; groupUrl: string | null; groupName?: string | null };

export function Studio({
  date,
  themeName,
  themePrompt,
  tone,
  groups,
  initialGroupId,
  planItemId,
  initial,
}: {
  date: string;
  themeName: string;
  themePrompt: string;
  tone: string;
  groups: GroupOption[];
  initialGroupId?: string;
  planItemId?: string;
  initial: Draft | null;
}) {
  const [draft, setDraft] = useState<Draft | null>(initial);
  const [body, setBody] = useState(initial?.body ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function generate(form: FormData) {
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const response = await fetch("/api/v1/drafts/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          date,
          tone: form.get("tone"),
          talkingPoints: form.get("talkingPoints") || "",
          groupId: form.get("groupId") || undefined,
          planItemId,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "The draft could not be written.");
      setDraft(data);
      setBody(data.body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Try again.");
    } finally {
      setPending(false);
    }
  }

  async function save() {
    if (!draft) return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/drafts/${draft.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body, revision: draft.revision }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Save failed. Your text is still in the box.");
      setDraft({ ...draft, body: data.body, revision: data.revision });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="studio">
      <form
        className="card stack"
        onSubmit={(event) => {
          event.preventDefault();
          void generate(new FormData(event.currentTarget));
        }}
      >
        <div>
          <p className="eyebrow">{themeName}</p>
          <h2 className="serif" style={{ fontSize: 32, margin: "4px 0" }}>Write from the facts you already gave us.</h2>
          <p className="muted">{themePrompt}</p>
        </div>
        <label className="field">
          <span>Group, if you want the rules in the draft</span>
          <select name="groupId" defaultValue={initialGroupId ?? ""}>
            <option value="">No group yet</option>
            {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Tone</span>
          <select name="tone" defaultValue={tone}>
            {["Friendly", "Professional", "Warm", "Direct"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Talking points, optional</span>
          <textarea name="talkingPoints" placeholder="A detail you want included. Leave this blank and no testimonial or offer will be invented." />
        </label>
        <button className="btn primary" disabled={pending}>{pending ? "Writing…" : "Generate draft"}</button>
        <p className="meta">Graphic templates are the next milestone. Copying a draft does not mark the post done.</p>
        {error ? <p className="error" role="alert">{error}</p> : null}
      </form>
      <section className="card stack">
        <p className="eyebrow">Draft</p>
        {draft ? (
          <>
            <h2 className="serif" style={{ fontSize: 28 }}>{draft.title}</h2>
            <textarea value={body} onChange={(event) => { setBody(event.target.value); setSaved(false); }} aria-label="Draft text" />
            <div className="btn-row">
              <button className="btn primary" type="button" disabled={pending} onClick={() => void save()}>{saved ? "Saved" : "Save edits"}</button>
              <CopyButton text={body} />
              {draft.groupUrl ? <a className="btn ghost" href={draft.groupUrl} target="_blank" rel="noreferrer">Open group</a> : null}
            </div>
            <ul>
              {draft.reminders.map((reminder) => <li key={reminder}>{reminder}</li>)}
            </ul>
          </>
        ) : (
          <div className="empty">
            <h2>Nothing drafted yet</h2>
            <p className="muted">Generate a draft when you are ready. If it fails, what you typed stays in the form.</p>
          </div>
        )}
      </section>
    </div>
  );
}
