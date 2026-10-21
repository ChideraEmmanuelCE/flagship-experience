"use client";

import { Canvas } from "@react-three/fiber";
import { Component, memo, useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { advanceTelemetry, emptyTelemetry, finishJourney, formatDuration, routes, type Intent, type Journey, type Preferences, type RouteId, type Telemetry } from "@/lib/drive";
import Icon, { type IconName } from "./Icon";
import DrivingWorld from "./DrivingWorld";
import MovingScenery from "./MovingScenery";
import DriveSettings from "./DriveSettings";
import JourneyJournal from "./JourneyJournal";
import RoadSound from "./RoadSound";
import useDriveProfile from "./useDriveProfile";

const intentions: { id: Intent; label: string; icon: IconName; description: string }[] = [
  { id: "cruise", label: "Cruise", icon: "arrow-up", description: "Cruise selected. Assisted acceleration holds a steady pace." },
  { id: "left", label: "Left lane", icon: "arrow-up-left", description: "Left selected. The car gently moves into the left lane." },
  { id: "right", label: "Right lane", icon: "arrow-up-right", description: "Right selected. The car gently moves into the right lane." },
  { id: "brake", label: "Brake", icon: "brake", description: "Brake selected. The car slows to a controlled stop." },
];
const CAMERA = { position: [0, 1.8, 4] as [number, number, number], fov: 58, near: .1, far: 240 };
const GL = { antialias: true, alpha: true, powerPreference: "default" as const };
const fallback = <div className="road-fallback"><span>Static preview · 3D unavailable on this device</span></div>;

class RoadBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? fallback : this.props.children; }
}
const RoadScene = memo(function RoadScene({ active, still, intent, route, view, telemetry }: { active: boolean; still: boolean; intent: Intent; route: RouteId; view: Preferences["camera"]; telemetry: RefObject<Telemetry> }) {
  return <div className={`world-layer route-${route}`} aria-hidden="true"><MovingScenery active={active} still={still} route={route} telemetry={telemetry}/><RoadBoundary><Canvas camera={CAMERA} dpr={[1, 1.5]} frameloop={active && !still ? "always" : "demand"} gl={GL} fallback={fallback}><DrivingWorld active={active} still={still} targetLane={intent === "left" ? -1 : intent === "right" ? 1 : 0} route={route} view={view} telemetry={telemetry}/></Canvas></RoadBoundary></div>;
});

export default function Experience() {
  const { profile, setProfile, ready, storageError, checkpoint } = useDriveProfile();
  const p = profile.preferences;
  const frame = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const switchPad = useRef<HTMLButtonElement>(null);
  const telemetry = useRef<Telemetry>(emptyTelemetry());
  const [session, setSession] = useState<Journey | null>(null);
  const [intent, setIntent] = useState<Intent>("cruise");
  const [running, setRunning] = useState(false);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(true);
  const [systemReduced, setSystemReduced] = useState(false);
  const [readout, setReadout] = useState<Telemetry>(emptyTelemetry);
  const [notice, setNotice] = useState("Choose a route and make yourself comfortable. Start when you’re ready.");
  const [scanIndex, setScanIndex] = useState(0);
  const still = p.motion === "reduced" || (p.motion === "system" && systemReduced);
  const active = !!session && running && inView && visible;
  const route = routes.find(r => r.id === p.route)!;
  const targetSpeed = intent === "brake" ? 0 : route.pace * (p.pace === "gentle" ? .65 : 1);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setSystemReduced(media.matches);
    const onVisibility = () => setVisible(!document.hidden);
    onMotion(); onVisibility();
    media.addEventListener("change", onMotion); document.addEventListener("visibilitychange", onVisibility);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: .05 });
    if (panel.current) observer.observe(panel.current);
    return () => { observer.disconnect(); media.removeEventListener("change", onMotion); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);

  const finish = useCallback((arrived = false) => {
    if (!session) return;
    const t = telemetry.current;
    if (t.seconds > 0) setProfile(previous => finishJourney(previous, { ...session, distance: t.distance, seconds: t.seconds, control: previous.preferences.control }));
    else setProfile(previous => ({ ...previous, draft: null }));
    telemetry.current.speed = 0; setReadout({ ...telemetry.current }); setRunning(false); setSession(null);
    setNotice(arrived ? "You’ve arrived. Your journey is saved below. Take a moment, or choose somewhere new." : "Journey saved below. Add a reflection or choose your next escape.");
  }, [session, setProfile]);

  useEffect(() => {
    if (!active) return;
    let previousTime = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const next = advanceTelemetry(telemetry.current, targetSpeed, (now - previousTime) / 1000); previousTime = now;
      if (next.distance >= route.length) { next.distance = route.length; telemetry.current = next; finish(true); }
      else { telemetry.current = next; setReadout({ ...next }); }
    }, 100);
    return () => window.clearInterval(timer);
  }, [active, targetSpeed, route.length, finish]);

  useEffect(() => {
    if (!session) return;
    const draft = () => ({ ...session, distance: telemetry.current.distance, seconds: telemetry.current.seconds, control: p.control });
    const save = () => setProfile(previous => ({ ...previous, draft: draft() }));
    const onHide = () => { if (document.hidden) { save(); checkpoint(previous => ({ ...previous, draft: draft() })); } };
    const onExit = () => checkpoint(previous => ({ ...previous, draft: draft() }));
    const timer = window.setInterval(save, 5000);
    document.addEventListener("visibilitychange", onHide); window.addEventListener("pagehide", onExit);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", onHide); window.removeEventListener("pagehide", onExit); };
  }, [session, p.control, setProfile, checkpoint]);

  const changePreferences = useCallback((patch: Partial<Preferences>) => {
    setProfile(previous => ({ ...previous, preferences: { ...previous.preferences, ...patch } }));
    if (patch.control === "switch") window.requestAnimationFrame(() => switchPad.current?.focus({ preventScroll: true }));
  }, [setProfile]);
  const start = () => {
    if (!ready || session || profile.draft) return;
    const journey: Journey = { id: crypto.randomUUID(), startedAt: new Date().toISOString(), route: p.route, distance: 0, seconds: 0, control: p.control, note: "" };
    telemetry.current = emptyTelemetry(); setReadout(emptyTelemetry()); setSession(journey); setIntent("cruise"); setRunning(true);
    setProfile(previous => ({ ...previous, draft: journey })); setNotice("Your journey has begun. You choose the direction; assisted driving handles the pace.");
    if (p.control === "standard") scene.current?.focus({ preventScroll: true });
  };
  const resumeDraft = () => {
    const draft = profile.draft; if (!draft) return;
    telemetry.current = { speed: 0, distance: draft.distance, seconds: draft.seconds }; setReadout({ ...telemetry.current });
    setSession(draft); changePreferences({ route: draft.route }); setIntent("cruise"); setRunning(false);
    setNotice("Your saved journey is ready. Resume whenever you’re comfortable.");
  };
  const selectIntent = (next: Intent) => {
    if (!session) return;
    setIntent(next); setNotice(intentions.find(x => x.id === next)!.description + (still && next !== "brake" ? " Still scenery is on; the view stays steady." : ""));
  };
  const togglePause = () => { if (session) { setRunning(v => !v); setNotice(running ? "Drive paused. Your journey is waiting." : "Drive resumed. Travel at your own pace."); } };
  const scanActions = useMemo(() => session ? [...intentions.map(x => ({ id: x.id as string, label: x.label })), { id: "pause", label: running ? "Pause drive" : "Resume drive" }, { id: "end", label: "End & save" }] : [{ id: "start", label: profile.draft ? "Continue saved drive" : "Start journey" }], [session, running, profile.draft]);
  const scanned = scanActions[scanIndex % scanActions.length];
  useEffect(() => {
    if (p.control !== "switch" || !visible || !inView) return;
    const timer = window.setInterval(() => setScanIndex(i => (i + 1) % scanActions.length), p.scanSeconds * 1000);
    return () => window.clearInterval(timer);
  }, [p.control, p.scanSeconds, visible, inView, scanActions.length]);
  const chooseScanned = () => {
    if (scanned.id === "start") { if (profile.draft) resumeDraft(); else start(); }
    else if (scanned.id === "pause") togglePause();
    else if (scanned.id === "end") finish();
    else selectIntent(scanned.id as Intent);
    setScanIndex(0);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && session) { setRunning(false); setNotice("Drive paused."); return; }
    if (p.control === "switch" || p.shortcuts === "off" || e.target !== scene.current || !session || e.repeat) return;
    const keys: Record<string, Intent> = p.shortcuts === "wasd" ? { w: "cruise", a: "left", s: "brake", d: "right" } : { ArrowUp: "cruise", ArrowLeft: "left", ArrowDown: "brake", ArrowRight: "right" };
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === " ") { e.preventDefault(); togglePause(); }
    else if (keys[key]) { e.preventDefault(); selectIntent(keys[key]); }
  };
  const deleteJourney = useCallback((id: string) => setProfile(previous => ({ ...previous, journeys: previous.journeys.filter(j => j.id !== id) })), [setProfile]);
  const clearJourneys = useCallback(() => setProfile(previous => ({ ...previous, journeys: [] })), [setProfile]);
  const noteJourney = useCallback((id: string, note: string) => setProfile(previous => ({ ...previous, journeys: previous.journeys.map(j => j.id === id ? { ...j, note } : j) })), [setProfile]);
  const scannedClass = (id: string) => p.control === "switch" && scanned.id === id ? " scan-target" : "";

  return <div className={`drive-hub ${p.contrast ? "high-contrast" : ""}`} ref={frame} onKeyDown={onKeyDown}>
    <div className="journey-welcome"><div><p className="eyebrow">YOUR ROUTE. YOUR PACE.</p><h3>Where shall we go today?</h3></div><a href="#journey-journal" className="quiet-button"><Icon name="journal" size={17}/> My journeys <Icon name="arrow-down" size={14}/></a></div>
    <div className="route-cards" aria-label="Choose a scenic route">{routes.map((r, i) => <div key={r.id} className={`route-card ${p.route === r.id ? "chosen" : ""}`}><button className="route-choice" disabled={!!session || !ready} aria-pressed={p.route === r.id} onClick={() => { changePreferences({ route: r.id }); telemetry.current = emptyTelemetry(); setReadout(emptyTelemetry()); }}><span className="route-photo" style={{ backgroundImage: `url(${r.image})` }}><span>0{i + 1}</span>{p.route === r.id && <span className="route-selected"><Icon name="check" size={16}/> Selected</span>}</span><span className="route-card-copy"><strong>{r.name}</strong><span>{r.subtitle}</span><small>{(r.length / 1000).toFixed(1)} virtual km · Assisted drive</small></span></button><button className="favorite-route" aria-label={`${p.favorite === r.id ? "Remove" : "Save"} ${r.name} ${p.favorite === r.id ? "from" : "as"} favourite`} aria-pressed={p.favorite === r.id} onClick={() => changePreferences({ favorite: p.favorite === r.id ? null : r.id })}><Icon name="heart" size={16}/></button></div>)}</div>
    {session && <p className="route-lock-note">End this journey to choose a different route.</p>}
    <DriveSettings preferences={p} onChange={changePreferences}/>
    {!session && profile.draft && <div className="resume-card"><Icon name="route" size={23}/><div><strong>A journey is waiting for you.</strong><p>{routes.find(r => r.id === profile.draft!.route)!.name} · {(profile.draft.distance / 1000).toFixed(2)} km explored</p></div><button className="action-button" onClick={resumeDraft}>Continue saved drive</button><button className="quiet-button" onClick={() => setProfile(previous => ({ ...previous, draft: null }))}>Discard unfinished drive</button></div>}
    <div className="driving-experience" ref={panel}>
      <div className="experience-topbar"><span className="experiment-name"><span className="mini-symbol"><Icon name="signal" size="1em"/></span> NEURAL DRIVE <span className="concept-label">ACCESSIBLE DRIVING CONCEPT</span></span><div className="camera-switch" role="group" aria-label="Camera view"><button aria-pressed={p.camera === "cabin"} onClick={() => changePreferences({ camera: "cabin" })}>Cabin</button><button aria-pressed={p.camera === "driver"} onClick={() => changePreferences({ camera: "driver" })}><Icon name="eye" size={14}/> Driver’s eye</button></div></div>
      <div ref={scene} tabIndex={0} className={`cockpit-stage view-${p.camera} ${active && !still ? "is-driving" : "is-paused"}`} role="group" aria-label={`Driving simulator, ${route.name}. ${p.camera === "cabin" ? "A seated driver with hands at rest and a simulated neural link to the dashboard." : "Driver’s eye view with hands resting away from the wheel."}`} aria-describedby="drive-key-help">
        <RoadScene active={active} still={still} intent={intent} route={p.route} view={p.camera} telemetry={telemetry}/>
        {/* Transparent photographic cabin over a live road. No scrolling input controls the camera. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="cockpit-image" src={p.camera === "cabin" ? "/images/neural-cockpit.webp" : "/images/driver-cockpit.webp"} alt="" width="1672" height="941" draggable="false"/>
        {p.camera === "cabin" && <svg className="neural-link" viewBox="0 0 1600 900" fill="none" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="signalGradient"><stop stopColor="#8cffff"/><stop offset="1" stopColor="#13b4b2"/></linearGradient><filter id="signalGlow"><feGaussianBlur stdDeviation="5"/></filter></defs><path className="signal-glow" d="M354 365 C450 310 500 350 590 405 S725 440 825 470" stroke="url(#signalGradient)" strokeWidth="7" filter="url(#signalGlow)"/><path d="M354 365 C450 310 500 350 590 405 S725 440 825 470" stroke="#89f2f0" strokeOpacity=".6" strokeWidth="1.5"/><path className="signal-pulse" d="M354 365 C450 310 500 350 590 405 S725 440 825 470" stroke="white" strokeWidth="3" strokeDasharray="10 300"/><circle className="signal-ring" cx="354" cy="365" r="20" stroke="#92fafa" strokeWidth="1.3"/><circle cx="354" cy="365" r="5" fill="#b6ffff"/><circle cx="825" cy="470" r="5" fill="#9dffff"/></svg>}
        <div className="scene-location"><Icon name="route" size={13}/> {route.name.toUpperCase()}</div>
        <div className="signal-badge"><span className="status-dot"/>{!session ? "READY WHEN YOU ARE" : !active ? "JOURNEY PAUSED" : still ? "STILL SCENERY" : "JOURNEY IN MOTION"}<span>SIMULATED NEURAL SIGNAL</span></div>
        <div className="windshield-hud" aria-hidden="true"><span className="hud-route">{intent === "brake" ? "DECELERATING" : intent === "left" ? "LEFT LANE" : intent === "right" ? "RIGHT LANE" : "ASSISTED CRUISE"}</span><strong>{Math.round(readout.speed)}<small>km/h</small></strong><span className="hud-line"/></div>
        <span className="hands-label"><span/> Hands resting. You choose the journey.</span>
        {!!session && <button className={`pause-button${scannedClass("pause")}`} onClick={togglePause} aria-label={running ? "Pause drive" : "Resume drive"}><Icon name={running ? "pause" : "play"} size={16}/><span>{running ? "Pause" : "Resume"}</span></button>}
      </div>
      <div className="trip-toolbar"><div className="trip-readouts"><span><small>VIRTUAL DISTANCE</small><strong>{(readout.distance / 1000).toFixed(2)} <em>km</em></strong></span><span><small>ACTIVE TIME</small><strong>{formatDuration(readout.seconds)}</strong></span><span><small>SPEED</small><strong>{Math.round(readout.speed)} <em>km/h</em></strong></span></div><div className="trip-actions">{session ? <button className={`action-button end-button${scannedClass("end")}`} onClick={() => finish()}><Icon name="check" size={17}/> End & save</button> : <button className={`action-button${scannedClass("start")}`} onClick={start} disabled={!ready || !!profile.draft}><Icon name="play" size={17}/> Start journey</button>}</div></div>
      <div className="route-progress"><span>{route.name}</span><progress max={route.length} value={session ? readout.distance : 0} aria-label="Progress along selected virtual route"/><span>{(route.length / 1000).toFixed(1)} km</span></div>
      <div className="intent-console"><div className="console-copy"><span className="eyebrow">CHOOSE AN INTENTION</span><p>Direction from you. Assistance from the car.</p></div><div className="intent-buttons" role="group" aria-label="Simulated driving intentions">{intentions.map(x => <button key={x.id} disabled={!session} onClick={() => selectIntent(x.id)} className={`${intent === x.id && session ? "selected" : ""}${scannedClass(x.id)}`} aria-pressed={intent === x.id && !!session}><Icon name={x.icon} size={18}/>{x.label}</button>)}</div></div>
      {p.control === "switch" && <div className="switch-console"><div><strong role="status">Scanning: {scanned.label}</strong><p>Focus this button. Press your switch, Enter, or Space when the action you want is highlighted.</p></div><button ref={switchPad} className="action-button switch-pad" onClick={chooseScanned}>Select highlighted action</button></div>}
      <div className="simulation-status"><p role="status" aria-live="polite"><span className="status-dot"/>{notice}</p></div>
      <div className="drive-bottom"><p id="drive-key-help">{p.control === "switch" ? `Switch mode · one action every ${p.scanSeconds} seconds.` : p.shortcuts === "off" ? "Keyboard shortcuts off. All actions remain available as buttons." : `Focus the scene for ${p.shortcuts === "wasd" ? "W cruise · A left · S brake · D right" : "Up cruise · Left lane · Down brake · Right lane"}. Space pauses.`}{still && " Still scenery is on."} Leaving the scene pauses the drive.</p><RoadSound active={active} telemetry={telemetry}/></div>
      <p className="simulation-note">An accessible simulator concept. Controls stand in for intentions; this website does not read thoughts or control a real vehicle.</p>
    </div>
    <JourneyJournal journeys={profile.journeys} storageError={storageError} onDelete={deleteJourney} onClear={clearJourneys} onNote={noteJourney}/>
  </div>;
}
