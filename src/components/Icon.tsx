import type { ReactNode } from "react";

export type IconName = "arrow-right" | "arrow-left" | "arrow-up" | "arrow-down" | "arrow-up-right" | "arrow-up-left" | "signal" | "asterisk" | "plus" | "cross" | "dot" | "pause" | "play" | "brake";

const paths: Record<IconName, ReactNode> = {
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
