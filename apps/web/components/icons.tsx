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
