export function Pill({ status, children }: { status: string; children: React.ReactNode }) {
  const tone = status === "confirmed_allowed" ? "allowed" : status === "restricted" ? "restricted" : status === "not_allowed" ? "blocked" : status === "neutral" ? "neutral" : "unknown";
  return <span className={`pill ${tone}`}>{children}</span>;
}

export function members(count: number | null): string {
  if (count == null) return "Count unknown";
  return `${count.toLocaleString("en-US")} members`;
}
