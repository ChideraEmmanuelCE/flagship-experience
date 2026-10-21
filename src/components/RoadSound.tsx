"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { Telemetry } from "@/lib/drive";
import Icon from "./Icon";

export default function RoadSound({ active, telemetry }: { active: boolean; telemetry: RefObject<Telemetry> }) {
  const engine = useRef<{ ctx: AudioContext; gain: GainNode; source: AudioBufferSourceNode } | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState(false);
  const toggle = async () => {
    if (enabled) { setEnabled(false); return; }
    try {
      if (!engine.current) {
        const ctx = new AudioContext();
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
        const samples = buffer.getChannelData(0);
        let last = 0;
        for (let i = 0; i < samples.length; i++) { last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; samples[i] = last * 3.5; }
        const source = ctx.createBufferSource(); source.buffer = buffer; source.loop = true;
        const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 650;
        const gain = ctx.createGain(); gain.gain.value = 0;
        source.connect(filter); filter.connect(gain); gain.connect(ctx.destination); source.start();
        engine.current = { ctx, gain, source };
      }
      await engine.current.ctx.resume(); setEnabled(true); setError(false);
    } catch { setError(true); }
  };
  useEffect(() => {
    const update = () => {
      const e = engine.current;
      if (e && e.ctx.state !== "closed") e.gain.gain.setTargetAtTime(enabled && active ? Math.min(telemetry.current.speed / 50, 1) * .22 : 0, e.ctx.currentTime, .2);
    };
    update(); const timer = window.setInterval(update, 200);
    return () => window.clearInterval(timer);
  }, [enabled, active, telemetry]);
  useEffect(() => () => { engine.current?.source.stop(); void engine.current?.ctx.close(); }, []);
  return <><button className="quiet-button sound-button" onClick={toggle} aria-pressed={enabled}><Icon name={enabled ? "volume" : "muted"} size={17}/>{enabled ? "Road sound on" : "Road sound off"}</button>{error && <span className="sound-error" role="status">Sound unavailable in this browser.</span>}</>;
}
