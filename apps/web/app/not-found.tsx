import Link from "next/link";

export default function NotFound() {
  return (
    <main className="site-wrap" style={{ paddingTop: 48 }}>
      <p className="eyebrow">Missing</p>
      <h1 className="display" style={{ fontSize: 64 }}>That page is not in the edition.</h1>
      <Link className="btn primary" href="/">Back to PostLocal</Link>
    </main>
  );
}
