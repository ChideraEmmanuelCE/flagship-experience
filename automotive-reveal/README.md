# OBSIDIAN — A Cinematic Automotive Reveal

An original interactive WebGL automotive experience inspired by the visual **technique** of a luxury SUV assembly / liquid-metal reel. It features a black liquid pool, an animated metallic hand, a floating crest, a spike / particle bloom, and a procedurally modeled glossy black off-road SUV that forms from its individual 3D parts.

![WebGL](https://img.shields.io/badge/WebGL-Three.js-black) ![Deploy](https://img.shields.io/badge/Deploy-Vercel-black)

## Features

- Cinematic 13-second staged reveal, with an interactive, scrubbable timeline.
- Procedural detailed 3D car, no copied or downloaded car-model assets. It is a *stylized G-Class-inspired design study*, not an official licensed model.
- Liquid metallic meshes, morphing hand, crest, spikes and an instanced-particle cloud.
- Physically based rendering, reflection environment, lights, soft shadows, black-gloss materials, tinted windows and red leather seats.
- 360° touch/mouse orbit controls, pinch/scroll to zoom, replay, optional synthesized sound, and mobile/reduced-motion support.
- Responsive editorial one-page site with independent automotive concept branding.

## Run locally

Requires any static file server. No npm installation or API keys necessary.

```bash
python3 -m http.server 3000
# open http://localhost:3000
```

Internet access is needed in the browser to load the official Three.js ES modules from jsDelivr and fonts from Google Fonts. The complete WebGL source is in `app.js`, and the site is in `index.html`/`styles.css`.

## Deployment

Deploy the contents of this folder as a static Vercel project. When stored in a monorepo, set **Root Directory** to `automotive-reveal` and **Framework Preset** to `Other`.

## Credits and usage

- 3D scene and procedural vehicle meshes: original project code.
- Library: [Three.js](https://threejs.org/).
- Fonts: DM Sans and Space Grotesk (Google Fonts).
- Reference inspiration: a cinematic luxury-car 3D animation shown in a public short video shared by `@Raynerdtech`.

This is an independent motion/engineering concept, not affiliated with or endorsed by Mercedes-Benz or any other automaker. Reference brand marks, model meshes, or animations have not been redistributed.