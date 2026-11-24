export function Logo({ tone = "ink" }: { tone?: "ink" | "paper" }) {
  const pupil = tone === "paper" ? "#f6f1e7" : "#1b2a22";
  return (
    <span className={`brand ${tone === "paper" ? "paper" : ""}`}>
      <svg viewBox="8 6 50 66" aria-hidden="true">
        <circle cx="36" cy="26" r="18" fill="currentColor" />
        <path fill="currentColor" d="M18 26h16v18c0 8-3.2 14-8 20-4.8-6-8-12-8-20V26Z" />
        <circle cx="41.5" cy="26" r="5.5" fill="#a67c3d" />
        <circle cx="41.5" cy="26" r="2.05" fill={pupil} />
      </svg>
      <span className="brand-name"><b>Post</b><span>Local</span></span>
    </span>
  );
}
