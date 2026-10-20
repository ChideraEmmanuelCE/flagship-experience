# Neural Drive — Chidera Emmanuel

A light editorial portfolio with a self-contained, interactive driving concept.
The driver sits inside the car with hands at rest. A simulated neural signal links
the headband to the dashboard while a real-time Three.js road moves through the
transparent windshield. Page scrolling never controls the camera or simulation.

## Experience

- Cruise, left lane, right lane and brake simulate driving intentions.
- Pause freezes the drive. Animation also pauses offscreen and in hidden tabs.
- Reduced-motion preferences disable automatic playback.
- The scene has a static fallback when WebGL is unavailable.
- Controls are a browser simulation; there is no real brain input or hardware integration.

## Visual asset

`public/images/neural-cockpit.webp` is a generated photographic foreground with
transparent window openings, created with the built-in image generation tool and
encoded as WebP with its alpha preserved. The road is rendered behind it in 3D;
the cockpit is a photographic layer, not an orbitable 3D car model.

`public/images/scenic-route.webp` is a generated photographic landscape behind
the transparent WebGL layer. Asset prompt: real straight countryside highway
leading toward coastal foothills, oak and olive trees, warm morning light,
natural asphalt and metal guardrails, no cars, people, text or stylization.

Asset prompt: photoreal luxury ivory electric-car interior viewed forward from
the rear seat; a young adult Black driver wearing a cream shirt and silver neural
headband sits in the left driver seat with hands on his lap, away from the
steering wheel; visible dashboard and console; bright daylight; genuinely
transparent windshield and side windows for an animated road; no logos or text.

## Stack
Next.js 15 · React Three Fiber · Drei · Three.js · GSAP · Tailwind

## Run
```bash
npm install
npm run dev
```

Production verification: `npm run build`.
