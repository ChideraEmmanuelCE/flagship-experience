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

## Accessible journeys

- Three finite scenic routes: coast (2.5 km), woodland (1.5 km), and city (1 km).
- Cabin and driver’s-eye photographic views over the same real-time road.
- Explicit Start, Pause/Resume, Brake, and End & save controls. Arrival saves automatically.
- Gentle assisted pace by default; optional regular pace, increased contrast and still scenery.
- Configurable WASD/arrow shortcuts work while the scene has focus. Escape pauses.
- Single-switch scanning cycles over actions at 2, 3 or 5 seconds. The selection pad is a native button, usable by switches mapped to Enter/Space.
- Road sound is synthesized locally with Web Audio and starts only after an explicit click.
- Drive telemetry is independent of WebGL, so still scenery and fallback previews can retain the same controls. Active time and distance pause when the driving panel is offscreen or the document is hidden.

## Local journal and data

The versioned `neural-drive:v1` localStorage profile contains preferences, up to 100 completed virtual journeys and one unfinished draft. Drafts checkpoint every five seconds and on page hide. Reopening offers a paused continuation. A completed journey stores its start time, route, virtual distance, active duration, last selected control mode, and an optional reflection (280 characters). No GPS, diagnosis or brain activity is requested. No journey data is sent to a backend; this is browser storage, not an authenticated account or cross-device sync. Shared-browser users can see the journal, and clearing browser storage deletes it. A storage failure displays a warning and leaves in-memory export available.

Journeys can be deleted individually or cleared with an inline confirmation. CSV export quotes notes and neutralizes spreadsheet formulas. Restored profiles are validated; malformed entries are ignored.

## New generated assets

All were made with the built-in image generation tool, then encoded as WebP; window alpha is preserved. The cockpit layers are photographs, not orbitable car models. Mirrors are part of those static photographs.

- `public/images/woodland-route.webp`: photoreal forward view of a quiet straight woodland road, mature trees, filtered daylight, driver-height camera, central vanishing point, no cars, people, text, logos, or interior.
- `public/images/city-route.webp`: photoreal quiet modern boulevard with warm stone and glass buildings and trees, morning daylight, central straight road, no cars, text, logos, or interior.
- `public/images/driver-cockpit.webp`: photoreal first-person ivory-leather and wood car interior, hands resting on thighs away from the wheel, wide windshield and side windows with genuine alpha transparency, natural daylight, no brands or floating displays.

The interface is an early accessibility concept. It has not been certified for WCAG conformance or validated with disabled participants. Real BCI hardware, gaze and voice inputs are not implemented.

Data/telemetry checks (Node 22.6+):
```bash
node --experimental-strip-types --test tests/drive.test.mjs
```
