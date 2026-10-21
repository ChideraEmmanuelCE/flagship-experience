export const routes = [
  { id: "coast", name: "Coastal escape", subtitle: "Open skies. Room to breathe.", image: "/images/scenic-route.webp", pace: 50, length: 2500, color: "#c9d3d1" },
  { id: "woodland", name: "Woodland way", subtitle: "Sunlight through the trees.", image: "/images/woodland-route.webp", pace: 35, length: 1500, color: "#c3d3b7" },
  { id: "city", name: "Morning in the city", subtitle: "A quiet boulevard, your own pace.", image: "/images/city-route.webp", pace: 30, length: 1000, color: "#d3dce1" },
] as const;

export type RouteId = typeof routes[number]["id"];
export type Intent = "cruise" | "left" | "right" | "brake";
export type Telemetry = { speed: number; distance: number; seconds: number };
export type Preferences = {
  route: RouteId; camera: "cabin" | "driver"; control: "standard" | "switch";
  motion: "system" | "reduced" | "full"; contrast: boolean; pace: "gentle" | "normal";
  shortcuts: "wasd" | "arrows" | "off"; scanSeconds: number; favorite: RouteId | null;
};
export type Journey = {
  id: string; startedAt: string; route: RouteId; distance: number; seconds: number;
  control: Preferences["control"]; note: string;
};
export type Profile = { version: 1; preferences: Preferences; journeys: Journey[]; draft: Journey | null };
export const STORAGE_KEY = "neural-drive:v1";
export const defaultPreferences: Preferences = {
  route: "coast", camera: "cabin", control: "standard", motion: "system", contrast: false,
  pace: "gentle", shortcuts: "wasd", scanSeconds: 3, favorite: null,
};
export const emptyProfile = (): Profile => ({ version: 1, preferences: { ...defaultPreferences }, journeys: [], draft: null });
export const emptyTelemetry = (): Telemetry => ({ speed: 0, distance: 0, seconds: 0 });
const isRoute = (v: unknown): v is RouteId => routes.some(r => r.id === v);
const finite = (v: unknown, max: number) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= max;

function validJourney(value: unknown): Journey | null {
  if (!value || typeof value !== "object") return null;
  const j = value as Record<string, unknown>;
  if (typeof j.id !== "string" || !j.id || j.id.length > 80 || typeof j.startedAt !== "string" || !Number.isFinite(Date.parse(j.startedAt)) || !isRoute(j.route) || !finite(j.distance, 1e8) || !finite(j.seconds, 1e7) || (j.control !== "standard" && j.control !== "switch")) return null;
  return { id: j.id, startedAt: j.startedAt, route: j.route, distance: j.distance as number, seconds: j.seconds as number, control: j.control, note: typeof j.note === "string" ? j.note.slice(0, 280) : "" };
}

export function readProfile(raw: string | null): Profile {
  const fallback = emptyProfile();
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1) return fallback;
    const p = parsed.preferences || {};
    const preferences: Preferences = {
      route: isRoute(p.route) ? p.route : "coast", camera: p.camera === "driver" ? "driver" : "cabin",
      control: p.control === "switch" ? "switch" : "standard",
      motion: ["system", "reduced", "full"].includes(p.motion) ? p.motion : "system",
      contrast: p.contrast === true, pace: p.pace === "normal" ? "normal" : "gentle",
      shortcuts: ["wasd", "arrows", "off"].includes(p.shortcuts) ? p.shortcuts : "wasd",
      scanSeconds: [2, 3, 5].includes(p.scanSeconds) ? p.scanSeconds : 3,
      favorite: isRoute(p.favorite) ? p.favorite : null,
    };
    const journeys = Array.isArray(parsed.journeys) ? parsed.journeys.map(validJourney).filter((j: Journey | null): j is Journey => j !== null).slice(0, 100) : [];
    return { version: 1, preferences, journeys: Array.from(new Map(journeys.map((j: Journey) => [j.id, j])).values()) as Journey[], draft: validJourney(parsed.draft) };
  } catch { return fallback; }
}

export function advanceTelemetry(current: Telemetry, targetSpeed: number, seconds: number): Telemetry {
  const dt = Math.max(0, Math.min(seconds, .5));
  let speed = targetSpeed + (current.speed - targetSpeed) * Math.exp(-(targetSpeed === 0 ? 1.5 : .75) * dt);
  if (speed < .08) speed = 0;
  return { speed, distance: current.distance + (current.speed + speed) / 2 / 3.6 * dt, seconds: current.seconds + dt };
}

export function finishJourney(profile: Profile, journey: Journey): Profile {
  return { ...profile, draft: null, journeys: [journey, ...profile.journeys.filter(j => j.id !== journey.id)].slice(0, 100) };
}

export function formatDuration(seconds: number) {
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function journalCsv(journeys: Journey[]) {
  // Formula-leading user notes remain plain text in spreadsheet applications.
  const cell = (s: string) => `"${(/^[\s]*[=+@-]/.test(s) ? "'" + s : s).replace(/"/g, '""')}"`;
  return ["Started,Route,Virtual kilometres,Active seconds,Control mode,Note", ...journeys.map(j => [j.startedAt, routes.find(r => r.id === j.route)!.name, (j.distance / 1000).toFixed(3), String(Math.round(j.seconds)), j.control, j.note].map(cell).join(","))].join("\r\n");
}
