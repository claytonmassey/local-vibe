type IconProps = { size?: number };

function Svg({ size = 22, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export function IconMegaphone(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 10.5v3a1.5 1.5 0 0 0 1.5 1.5H8l.8 4h2.1l-.8-4" />
      <path d="M8.2 9 18 5.5v13L8.2 15V9Z" />
      <path d="M18 9.2a2.8 2.8 0 0 1 0 5.6" />
    </Svg>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="2.25" />
      <path d="M4.6 18.4c.7-2.5 2.5-3.7 4.4-3.7s3.7 1.2 4.4 3.7" />
      <circle cx="16.3" cy="9" r="1.85" />
      <path d="M15 14.7c1.5.3 2.7 1.2 3.4 3.2" />
    </Svg>
  );
}

export function IconSpark(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.2 13.5 9 19.2 10.5 13.5 12 12 17.8 10.5 12 4.8 10.5 10.5 9 12 3.2Z" />
      <path d="M18.2 15.4 18.8 17.2 20.6 17.8 18.8 18.4 18.2 20.2 17.6 18.4 15.8 17.8 17.6 17.2 18.2 15.4Z" />
    </Svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.25" y="4.25" width="15.5" height="15.5" rx="3" />
      <path d="m8 12.2 2.7 2.7 5.5-5.8" />
    </Svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.5 11.2 12 4.5l7.5 6.7" />
      <path d="M7.2 10.2V19.5h9.6V10.2" />
    </Svg>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3.5v3M16 3.5v3M4 10h16" />
    </Svg>
  );
}

export function IconPin(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 20.5s5.5-4.8 5.5-9.2a5.5 5.5 0 1 0-11 0c0 4.4 5.5 9.2 5.5 9.2Z" />
      <circle cx="12" cy="11.2" r="1.7" />
    </Svg>
  );
}

export function IconPen(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14.2 5.2 18.8 9.8 8.8 19.8H4.2v-4.6L14.2 5.2Z" />
    </Svg>
  );
}

export function IconSun(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.6v2M12 18.4v2M3.6 12h2M18.4 12h2M6 6l1.4 1.4M16.6 16.6 18 18M18 6l-1.4 1.4M7.4 16.6 6 18" />
    </Svg>
  );
}

export function IconBook(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 5.2h5.2A2.3 2.3 0 0 1 12.5 7.5V19H7.2A2.2 2.2 0 0 0 5 21.2V5.2Z" />
      <path d="M19 5.2h-5.2A2.3 2.3 0 0 0 11.5 7.5V19h5.3A2.2 2.2 0 0 1 19 21.2V5.2Z" />
    </Svg>
  );
}

export function IconDots(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="6" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.15" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconList(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 7h11M8 12h11M8 17h11" />
      <path d="M4.5 7h.01M4.5 12h.01M4.5 17h.01" />
    </Svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

export function IconLeave(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10 7V5.8A1.8 1.8 0 0 1 11.8 4h6.4A1.8 1.8 0 0 1 20 5.8v12.4a1.8 1.8 0 0 1-1.8 1.8h-6.4A1.8 1.8 0 0 1 10 18.2V17" />
      <path d="M4 12h10M11.2 8.2 15 12l-3.8 3.8" />
    </Svg>
  );
}

export function IconChevron(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m9 6 6 6-6 6" />
    </Svg>
  );
}

export function IconHeart({ filled = false, size = 22 }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19.2s-6.4-4-8.2-7.4C2.4 9.2 3.3 6.2 6 5.6c1.8-.4 3.3.3 4 1.6.7-1.3 2.2-2 4-1.6 2.7.6 3.6 3.6 2.2 6.2-1.8 3.4-8.2 7.4-8.2 7.4Z" />
    </svg>
  );
}
