"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PublisherActions() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function run(path: string, body: unknown) {
    setError(null);
    const response = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error?.message || "Try again.");
      return;
    }
    setMessage(path.includes("publish") ? `Published ${data.version}.` : data.committed ? "Import committed." : "Import stayed in review.");
    router.refresh();
  }
  return (
    <div className="btn-row">
      <button className="btn ghost" onClick={() => run("/api/v1/admin/imports", { commit: true })}>Run import preview</button>
      <button className="btn primary" onClick={() => run("/api/v1/admin/editions/ed_founding/publish", {})}>Publish snapshot</button>
      {message ? <p className="meta">{message}</p> : null}
      {error ? <p className="error" role="alert">{error}</p> : null}
    </div>
  );
}
