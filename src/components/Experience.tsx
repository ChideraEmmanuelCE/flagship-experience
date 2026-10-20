"use client";

import { Canvas } from "@react-three/fiber";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import DrivingWorld, { type DrivingTelemetry } from "./DrivingWorld";

type Intent = "cruise" | "left" | "right" | "brake";
const intentions: { id: Intent; label: string; icon: string; description: string }[] = [
  { id: "cruise", label: "Cruise", icon: "↑", description: "Intention received. The car gently builds speed." },
  { id: "left", label: "Left lane", icon: "↖", description: "A new direction. The car moves into the left lane." },
  { id: "right", label: "Right lane", icon: "↗", description: "A new direction. The car moves into the right lane." },
  { id: "brake", label: "Brake", icon: "◫", description: "Slow down. The car comes to a calm, controlled stop." },
];

class RoadBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="road-fallback"><span>Scenic drive preview · 3D unavailable on this device</span></div> : this.props.children; }
}

export default function Experience() {
  const frame = useRef<HTMLDivElement>(null);
  const telemetry = useRef<DrivingTelemetry>({ speed: 0, distance: 0 });
  const [intent, setIntent] = useState<Intent>("cruise");
  const [running, setRunning] = useState(true);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [readout, setReadout] = useState({ speed: 0, distance: 0 });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => { setReducedMotion(media.matches); if (media.matches) setRunning(false); };
    const onVisibility = () => setVisible(!document.hidden);
    onMotion(); onVisibility();
    media.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "120px" });
    if (frame.current) observer.observe(frame.current);
    const timer = window.setInterval(() => setReadout(previous => previous.speed === telemetry.current.speed && previous.distance === telemetry.current.distance ? previous : { ...telemetry.current }), 160);
    return () => { observer.disconnect(); window.clearInterval(timer); media.removeEventListener("change", onMotion); document.removeEventListener("visibilitychange", onVisibility); };
  }, []);

  const active = running && inView && visible;
  const command = intentions.find(x => x.id === intent)!;
  const selectIntent = (next: Intent) => { setIntent(next); setRunning(true); };

  return (
    <div className="driving-experience" ref={frame}>
      <div className="experience-topbar"><span className="experiment-name"><span className="mini-symbol">⌁</span> NEURAL DRIVE <span className="concept-label">CONCEPT 001</span></span><span className="view-label">INTERIOR VIEW <span>↗</span></span></div>
      <div className={`cockpit-stage ${active ? "is-driving" : "is-paused"}`} role="group" aria-label="Driving simulation: a seated driver with hands at rest, a moving road, and a simulated neural link to the dashboard.">
        <div className="world-layer" aria-hidden="true"><div className="scenery-backdrop" /><RoadBoundary><Canvas camera={{ position: [0, 1.8, 4], fov: 58, near: 0.1, far: 240 }} dpr={[1, 1.5]} frameloop={active ? "always" : "demand"} gl={{ antialias: true, alpha: true, powerPreference: "default" }} fallback={<div className="road-fallback" />}><DrivingWorld active={active} targetSpeed={intent === "brake" ? 0 : 62} targetLane={intent === "left" ? -1 : intent === "right" ? 1 : 0} telemetry={telemetry} /></Canvas></RoadBoundary></div>
        {/* The transparent windshield preserves the real-time 3D road behind the cabin. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="cockpit-image" src="/images/neural-cockpit.webp" alt="" width="1672" height="941" draggable="false" />
        <svg className="neural-link" viewBox="0 0 1600 900" fill="none" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="signalGradient"><stop stopColor="#8cffff" /><stop offset="1" stopColor="#13b4b2" /></linearGradient><filter id="signalGlow"><feGaussianBlur stdDeviation="5" /></filter></defs><path className="signal-glow" d="M354 365 C450 310 500 350 590 405 S725 440 825 470" stroke="url(#signalGradient)" strokeWidth="7" filter="url(#signalGlow)"/><path d="M354 365 C450 310 500 350 590 405 S725 440 825 470" stroke="#89f2f0" strokeOpacity=".6" strokeWidth="1.5"/><path className="signal-pulse" d="M354 365 C450 310 500 350 590 405 S725 440 825 470" stroke="white" strokeWidth="3" strokeDasharray="10 300"/><circle className="signal-ring" cx="354" cy="365" r="20" stroke="#92fafa" strokeWidth="1.3"/><circle cx="354" cy="365" r="5" fill="#b6ffff"/><circle cx="825" cy="470" r="5" fill="#9dffff"/></svg>
        <div className="scene-location"><span className="tiny-cross">+</span> SCENIC ROUTE / 08:42 AM</div>
        <div className="signal-badge"><span className="status-dot" /> {active ? "NEURAL LINK ACTIVE" : "SIMULATION PAUSED"}<span>SIMULATED SIGNAL</span></div>
        <div className="windshield-hud" aria-hidden="true"><span className="hud-route">{intent === "brake" ? "DECELERATING" : intent === "left" ? "← LEFT LANE" : intent === "right" ? "RIGHT LANE →" : "ROUTE CLEAR"}</span><strong>{Math.round(readout.speed)}<small>km/h</small></strong><span className="hud-line" /></div>
        <span className="hands-label"><span /> Hands resting. Mind connected.</span>
        <button className="pause-button" onClick={() => setRunning(v => !v)} aria-label={running ? "Pause drive" : "Resume drive"}>{running ? "Ⅱ" : "▷"}<span>{running ? "Pause" : "Play"}</span></button>
      </div>
      <div className="intent-console"><div className="console-copy"><span className="eyebrow">TRY AN INTENTION</span><p>You choose. The car responds.</p></div><div className="intent-buttons" aria-label="Simulate a driving intention">{intentions.map(x => <button key={x.id} onClick={() => selectIntent(x.id)} className={intent === x.id ? "selected" : ""} aria-pressed={intent === x.id}><span>{x.icon}</span>{x.label}</button>)}</div></div>
      <div className="simulation-status"><p role="status" aria-live="polite"><span className="status-dot" /> {command.description}</p><span>{(readout.distance / 1000).toFixed(2)} km explored</span></div>
      <p className="simulation-note">Buttons simulate the driver’s intentions. No headset or brain data is used.{reducedMotion && " Reduced motion is respected; press Play when you’re ready."}</p>
    </div>
  );
}
