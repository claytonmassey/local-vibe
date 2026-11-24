"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";

const links = [
  ["/home", "Home"],
  ["/calendar", "Calendar"],
  ["/events", "Events"],
  ["/studio", "Post Studio"],
  ["/groups", "Facebook groups"],
  ["/today", "Today"],
  ["/library", "Library"],
  ["/more", "More"],
];

export function Shell({
  children,
  name,
  business,
  role,
}: {
  children: React.ReactNode;
  name: string;
  business: string;
  role: string;
}) {
  const path = usePathname();
  const items = role === "admin" || role === "publisher" ? [...links, ["/publisher", "Publisher"]] : links;
  return (
    <div className="shell">
      <a className="skip" href="#content">Skip to content</a>
      <aside className="sidebar">
        <Link href="/home" aria-label="PostLocal home"><Logo /></Link>
        <nav className="nav" aria-label="Planner">
          {items.map(([href, label]) => (
            <Link key={href} href={href} aria-current={path === href || (href !== "/home" && path.startsWith(href)) ? "page" : undefined}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="who">
          <strong>{name}</strong>
          <span>{business}</span>
        </div>
      </aside>
      <div className="main" id="content">{children}</div>
    </div>
  );
}
