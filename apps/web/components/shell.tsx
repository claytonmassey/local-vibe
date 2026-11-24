"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SignOutButton } from "./actions";
import { IconBook, IconCalendar, IconDots, IconHome, IconLeave, IconList, IconMenu, IconPen, IconPin, IconSun, IconUsers } from "./icons";
import { Logo } from "./logo";

const links: { href: string; label: string; icon: typeof IconHome }[] = [
  { href: "/home", label: "Home", icon: IconHome },
  { href: "/calendar", label: "Calendar", icon: IconCalendar },
  { href: "/events", label: "Events", icon: IconPin },
  { href: "/studio", label: "Post Studio", icon: IconPen },
  { href: "/groups", label: "Facebook groups", icon: IconUsers },
  { href: "/today", label: "Today", icon: IconSun },
  { href: "/library", label: "Library", icon: IconBook },
  { href: "/more", label: "More", icon: IconDots },
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
  const [open, setOpen] = useState(true);
  const items = role === "admin" || role === "publisher" ? [...links, { href: "/publisher", label: "Publisher", icon: IconList }] : links;

  useEffect(() => {
    if (localStorage.getItem("pl_nav") === "closed") setOpen(false);
  }, []);

  function toggle() {
    setOpen((value) => {
      localStorage.setItem("pl_nav", value ? "closed" : "open");
      return !value;
    });
  }

  return (
    <div className={open ? "shell" : "shell nav-collapsed"}>
      <a className="skip" href="#content">Skip to content</a>
      <aside className="sidebar">
        <div className="side-head">
          <Link href="/home" aria-label="PostLocal home"><Logo /></Link>
          <button type="button" className="nav-toggle" aria-expanded={open} aria-controls="planner-nav" aria-label={open ? "Collapse menu" : "Expand menu"} onClick={toggle}>
            <IconMenu size={20} />
          </button>
        </div>
        <nav className="nav" id="planner-nav" aria-label="Planner">
          {items.map((item) => {
            const Icon = item.icon;
            const current = path === item.href || (item.href !== "/home" && path.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} aria-current={current ? "page" : undefined} title={item.label}>
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="who">
          <div className="who-name">
            <strong>{name}</strong>
            {business ? <span>{business}</span> : null}
          </div>
          <SignOutButton className="btn quiet nav-signout">
            <IconLeave size={18} />
            <span>Sign out</span>
          </SignOutButton>
        </div>
      </aside>
      <div className="main" id="content">{children}</div>
    </div>
  );
}
