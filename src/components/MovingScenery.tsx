"use client";

import { memo, useEffect, useRef, type RefObject } from "react";
import { routes, type RouteId, type Telemetry } from "@/lib/drive";

/** Receding photographic scenery, independent of the page and fixed cabin. */
export default memo(function MovingScenery({ active, still, route, telemetry }: {
  active: boolean; still: boolean; route: RouteId; telemetry: RefObject<Telemetry>;
}) {
  const layers = useRef<HTMLDivElement>(null);
  const travelled = useRef(0);
  const lastDistance = useRef(0);
  const image = routes.find(r => r.id === route)!.image;

  useEffect(() => {
    travelled.current = 0;
    lastDistance.current = telemetry.current.distance;
    if (layers.current) for (const layer of Array.from(layers.current.children) as HTMLElement[]) {
      layer.style.transform = "scale(1)";
      layer.style.opacity = "0";
    }
  }, [route, telemetry]);

  useEffect(() => {
    if (!active || still) return;
    let frame = 0;
    let previous = performance.now();
    const smooth = (a: number, b: number, value: number) => {
      const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };
    const animate = (now: number) => {
      const dt = Math.min((now - previous) / 1000, .1);
      previous = now;
      const current = telemetry.current;
      if (current.distance < lastDistance.current) travelled.current = 0;
      lastDistance.current = current.distance;
      // Integrate speed between telemetry samples for smooth movement on every frame.
      // Braking naturally slows the scenery to a stop; pausing cancels this loop.
      if (current.speed > 0) {
        travelled.current += current.speed / 3.6 * dt;
        const children = layers.current?.children;
        if (children) for (let i = 0; i < children.length; i++) {
          const phase = (travelled.current / 48 + i * .5) % 1;
          const opacity = smooth(0, 8, travelled.current) * smooth(0, .16, phase) * (1 - smooth(.64, 1, phase));
          const layer = children[i] as HTMLElement;
          layer.style.transform = `scale(${1 + phase * .32})`;
          layer.style.opacity = opacity.toFixed(4);
        }
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [active, still, route, telemetry]);

  return <>
    <div className="scenery-backdrop" style={{ backgroundImage: `url(${image})` }} />
    <div ref={layers} className="scenery-flow" data-motion={still ? "still" : active ? "moving" : "paused"}>
      {[0, 1].map(i => <div key={i} className="scenery-backdrop scenery-pass" style={{ backgroundImage: `url(${image})`, opacity: 0 }} />)}
    </div>
  </>;
});
