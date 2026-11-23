export function Logo({ tone = "ink" }: { tone?: "ink" | "paper" }) {
  return (
    <span className={`brand ${tone === "paper" ? "paper" : ""}`}>
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path fill="currentColor" d="M16 3.2c4.8 0 8.6 3.6 8.6 8.6 0 6-6.8 13.4-8 14.6a.9.9 0 0 1-1.2 0c-1.2-1.2-8-8.6-8-14.6C7.4 6.8 11.2 3.2 16 3.2Z" />
        <path fill={tone === "paper" ? "#1e4a37" : "#f6f1e7"} d="M11.2 19.2v-4h2v4h-2Zm3.5 0V10.2h2V19.2h-2Zm3.6 0v-6.4h2v6.4h-2Z" />
      </svg>
      MarketMap
    </span>
  );
}
