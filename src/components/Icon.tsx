import type { ReactNode } from "react";

export type IconName = "arrow-right" | "arrow-left" | "arrow-up" | "arrow-down" | "arrow-up-right" | "arrow-up-left" | "signal" | "asterisk" | "plus" | "cross" | "dot" | "pause" | "play" | "brake" | "route" | "journal" | "lock" | "tree" | "city" | "waves" | "download" | "trash" | "settings" | "heart" | "check" | "volume" | "muted" | "eye";

const paths: Record<IconName, ReactNode> = {
  route: <><circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M9 6h6a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8"/></>,
  journal: <><rect x="5" y="3" width="15" height="18" rx="2"/><path d="M8 3v18M12 8h5m-5 4h5m-5 4h3M3 7h4m-4 5h4m-4 5h4"/></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/></>,
  tree: <><path d="m12 2-6 7h3l-5 6h5l-3 4h12l-3-4h5l-5-6h3L12 2Zm0 17v3"/></>,
  city: <><path d="M3 21V8h7V3h10v18M1 21h22M6 11v1m0 4v1m7-10h1m3 0h1m-5 4h1m3 0h1m-5 4h1m3 0h1m-4 6v-3h3v3"/></>,
  waves: <><path d="M2 7c3-4 5 4 8 0s5 4 8 0 4 0 4 0M2 12c3-4 5 4 8 0s5 4 8 0 4 0 4 0M2 17c3-4 5 4 8 0s5 4 8 0 4 0 4 0"/></>,
  download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>,
  trash: <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/></>,
  settings: <><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="var(--paper)"/><circle cx="15" cy="12" r="2" fill="var(--paper)"/><circle cx="8" cy="18" r="2" fill="var(--paper)"/></>,
  heart: <path d="M12 21 3.5 12.5C-2 7 6 0 12 6c6-6 14 1 8.5 6.5L12 21Z"/>,
  check: <path d="m4 12 5 5L20 6"/>,
  volume: <><path d="m11 4-6 5H2v6h3l6 5V4Zm5 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></>,
  muted: <><path d="m11 4-6 5H2v6h3l6 5V4Zm5 5 6 6m0-6-6 6"/></>,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
  "arrow-right": <path d="M4 12h16m-6-6 6 6-6 6" />,
  "arrow-left": <path d="M20 12H4m6-6-6 6 6 6" />,
  "arrow-up": <path d="M12 20V4m-6 6 6-6 6 6" />,
  "arrow-down": <path d="M12 4v16m-6-6 6 6 6-6" />,
  "arrow-up-right": <path d="M5 19 19 5M5 5h14v14" />,
  "arrow-up-left": <path d="M19 19 5 5m0 14V5h14" />,
  signal: <path d="M2 12h4l3-7 6 14 3-7h4" />,
  asterisk: <path d="M12 2v20M2 12h20M5 5l14 14M5 19 19 5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  cross: <path d="m6 6 12 12M6 18 18 6" />,
  dot: <circle cx="12" cy="12" r="6" fill="currentColor" stroke="none" />,
  pause: <><path d="M8 5v14M16 5v14" strokeWidth="3" /></>,
  play: <path d="m8 4 12 8-12 8V4Z" />,
  brake: <><path d="m8 3-5 5v8l5 5h8l5-5V8l-5-5H8Z" /><rect x="9" y="9" width="6" height="6" rx=".5" fill="currentColor" stroke="none" /></>,
};

export default function Icon({ name, size = 20 }: { name: IconName; size?: number | string }) {
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
