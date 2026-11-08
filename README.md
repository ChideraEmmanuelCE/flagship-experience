# OBSIDIAN — Cinematic Automotive Reveal

A full-screen, mobile-first automotive concept website featuring a photorealistic black SUV emerging from liquid metal. **The reveal is a pre-rendered MP4**, not a WebGL or CSS-rendered 3D car. This ensures the cinematic vehicle is visible on iPhone Safari even when WebGL is unavailable.

## Features
- Progressive SUV assembly from generated photographic frames
- 10.8-second cinematic film with original synthesized sound effects
- Muted, inline, autoplay-ready MP4 (H.264/AAC)
- Replay, sound toggle, accessible timeline scrubbing
- Still-image fallback if video playback fails
- Minimal black and silver interface; no emojis or low-poly 3D
- Static site deployable to Vercel without a build pipeline

## Run locally

```bash
python3 -m http.server 8080
```

Visit http://localhost:8080. For Safari, use HTTPS when testing on a phone via a remote address.

## Notes

The SUV reveal is an original AI-generated frame sequence blended into a cinematic film; it is not a continuously simulated physics morph or a rotatable 3D model. The reference clip is used for art direction only. No manufacturer partnership or affiliation is implied.

## Deployment

Deploy root as a static site on Vercel; project has no build command and no dependencies. Generated frames remain in `public/` as production assets; the video is at `/obsidian-reveal.mp4`.