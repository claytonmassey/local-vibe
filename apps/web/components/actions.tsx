"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

async function send(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || "Try again.");
  return data;
}

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  async function createAccount(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const session = await send("/api/v1/session", {
        method: "POST",
        body: JSON.stringify({ mode: "create", email, name }),
      });
      if (session.needsOnboarding) router.push("/onboarding");
      else router.push("/home");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="stack" onSubmit={createAccount}>
      <label className="field"><span>Name</span><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required /></label>
      <label className="field"><span>Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
      <button className="btn primary" disabled={pending}>{pending ? "Creating account…" : "Create account"}</button>
      {error ? <p className="error" role="alert">{error}</p> : null}
    </form>
  );
}

export function OnboardingForm({ initial }: { initial?: { businessName: string; category: string; zip: string; timeZone: string; offerings: string; tone: string; remindersOptIn?: boolean } }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  return (
    <form
      className="form-grid two"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setPending(true);
        setError(null);
        try {
          await send("/api/v1/onboarding", {
            method: "POST",
            body: JSON.stringify({
              businessName: form.get("businessName"),
              category: form.get("category"),
              zip: form.get("zip"),
              timeZone: form.get("timeZone"),
              offerings: form.get("offerings"),
              tone: form.get("tone"),
              remindersOptIn: form.get("remindersOptIn") === "on",
            }),
          });
          router.push("/home");
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Try again.");
        } finally {
          setPending(false);
        }
      }}
    >
      <label className="field"><span>Business name</span><input name="businessName" defaultValue={initial?.businessName} required /></label>
      <label className="field"><span>Category</span><input name="category" defaultValue={initial?.category} required /></label>
      <label className="field"><span>ZIP</span><input name="zip" defaultValue={initial?.zip ?? "77354"} pattern="\d{5}" required /></label>
      <label className="field">
        <span>Timezone</span>
        <select name="timeZone" defaultValue={initial?.timeZone ?? "America/Chicago"}>
          <option value="America/Chicago">Central — America/Chicago</option>
          <option value="America/New_York">Eastern — America/New_York</option>
          <option value="America/Denver">Mountain — America/Denver</option>
          <option value="America/Los_Angeles">Pacific — America/Los_Angeles</option>
        </select>
      </label>
      <label className="field" style={{ gridColumn: "1 / -1" }}><span>What you actually offer</span><textarea name="offerings" defaultValue={initial?.offerings} /></label>
      <label className="field">
        <span>Preferred tone</span>
        <select name="tone" defaultValue={initial?.tone ?? "Friendly"}>
          {["Friendly", "Professional", "Warm", "Direct"].map((tone) => <option key={tone}>{tone}</option>)}
        </select>
      </label>
      <label className="check">
        <input type="checkbox" name="remindersOptIn" defaultChecked={initial?.remindersOptIn} />
        <span>Save a reminder preference. Delivery arrives in the next release, so nothing will ping you yet.</span>
      </label>
      <div>
        <button className="btn primary" disabled={pending}>{pending ? "Saving…" : "Save and continue"}</button>
        {error ? <p className="error" role="alert">{error}</p> : null}
      </div>
    </form>
  );
}

export function PlanButtons({
  item,
}: {
  item: { id: string; revision: number; status: "planned" | "done"; groupId: string; date: string };
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  async function patch(status: "planned" | "done") {
    setPending(true);
    setError(null);
    try {
      await send(`/api/v1/plan-items/${item.id}`, { method: "PATCH", body: JSON.stringify({ revision: item.revision, status }) });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <div>
      <div className="btn-row">
        {item.status === "planned" ? (
          <button className="btn primary" disabled={pending} onClick={() => patch("done")}>{pending ? "Saving…" : "Mark posted"}</button>
        ) : (
          <button className="btn ghost" disabled={pending} onClick={() => patch("planned")}>Mark not done</button>
        )}
        <a className="btn ghost" href={`/studio?date=${item.date}&group=${item.groupId}&plan=${item.id}`}>Draft</a>
      </div>
      {error ? <p className="error" role="alert">{error}</p> : null}
    </div>
  );
}

export function AddSlot({
  groupId,
  windowId,
  date,
  restricted,
}: {
  groupId: string;
  windowId: string;
  date: string;
  restricted: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [ack, setAck] = useState(false);
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        try {
          await send("/api/v1/plan-items", {
            method: "POST",
            body: JSON.stringify({ groupId, windowId, date, kind: "verified", acknowledgeConditions: ack }),
          });
          router.push(`/today?date=${date}`);
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Try again.");
          setPending(false);
        }
      }}
    >
      {restricted ? (
        <label className="check">
          <input type="checkbox" checked={ack} onChange={(event) => setAck(event.target.checked)} required />
          <span>I understand the conditions. This still does not post anything.</span>
        </label>
      ) : null}
      <button className="btn primary" disabled={pending} style={{ marginTop: 10 }}>{pending ? "Adding…" : "Add to the week"}</button>
      {error ? <p className="error" role="alert">{error}</p> : null}
    </form>
  );
}

export function ReminderForm({ date, groupId }: { date: string; groupId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  return (
    <form
      className="stack"
      onSubmit={async (event) => {
        event.preventDefault();
        const notes = new FormData(event.currentTarget).get("notes");
        setPending(true);
        setError(null);
        try {
          await send("/api/v1/plan-items", {
            method: "POST",
            body: JSON.stringify({ groupId, date, kind: "personal_reminder", notes }),
          });
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Try again.");
        } finally {
          setPending(false);
        }
      }}
    >
      <label className="field"><span>Personal reminder</span><input name="notes" placeholder="A note only you will see" required /></label>
      <button className="btn ghost" disabled={pending}>{pending ? "Saving…" : "Save reminder"}</button>
      {error ? <p className="error" role="alert">{error}</p> : null}
    </form>
  );
}

export function FavoriteButton({ groupId, favorite }: { groupId: string; favorite: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <button
        className="btn ghost"
        onClick={async () => {
          setError(null);
          try {
            if (favorite) await send(`/api/v1/favorites/${groupId}`, { method: "DELETE" });
            else await send("/api/v1/favorites", { method: "POST", body: JSON.stringify({ groupId }) });
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Try again.");
          }
        }}
      >
        {favorite ? "Favorited" : "Favorite"}
      </button>
      {error ? <p className="error" role="alert">{error}</p> : null}
    </div>
  );
}

export function CorrectionForm({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  return (
    <form
      className="stack"
      onSubmit={async (event) => {
        event.preventDefault();
        const message = String(new FormData(event.currentTarget).get("message") || "");
        setError(null);
        try {
          await send("/api/v1/corrections", { method: "POST", body: JSON.stringify({ groupId, message }) });
          setDone(true);
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Try again.");
        }
      }}
    >
      <label className="field"><span>Report a correction</span><textarea name="message" required minLength={8} placeholder="What looks out of date?" /></label>
      <button className="btn ghost">Send to the publisher queue</button>
      {done ? <p className="meta">Sent. A publisher can see it without changing your plan notes.</p> : null}
      {error ? <p className="error" role="alert">{error}</p> : null}
    </form>
  );
}

export function CheckoutButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  return (
    <div>
      <button
        className="btn primary"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          try {
            const result = await send("/api/v1/checkout", { method: "POST", body: JSON.stringify({ offerId: "offer_founding" }) });
            router.push(result.url);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Try again.");
            setPending(false);
          }
        }}
      >
        {pending ? "Unlocking…" : "Unlock for $7.99"}
      </button>
      {error ? <p className="error" role="alert">{error}</p> : null}
    </div>
  );
}

export function RefundButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <button
        className="btn ghost"
        onClick={async () => {
          setError(null);
          try {
            await send(`/api/v1/orders/${orderId}/refund`, { method: "POST" });
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Try again.");
          }
        }}
      >
        Reset test access
      </button>
      {error ? <p className="error" role="alert">{error}</p> : null}
    </div>
  );
}

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      className="btn ghost"
      onClick={async () => {
        await fetch("/api/v1/session", { method: "DELETE" });
        router.push("/");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <button
        className="btn ghost"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setError(null);
          } catch {
            setError("Clipboard permission was blocked. Select the draft and copy it manually.");
          }
        }}
      >
        {copied ? "Copied" : "Copy draft"}
      </button>
      {error ? <p className="error" role="alert">{error}</p> : null}
    </div>
  );
}
