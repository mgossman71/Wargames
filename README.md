# Wargames

> A cinematic, browser-based tribute to the 1983 film **_WarGames_** — step inside the
> **WOPR / JOSHUA** terminal, watch **NORAD's** eight-screen display wall track live object
> traffic over a world map, and run a **Global Thermonuclear War** simulation that ends the
> way it should: there is no winning move.

A **fan-made, educational** interactive experience. Not affiliated with, sponsored by, or
endorsed by the original film, its studio, or any rights holder. All force data and event
timelines are **fictional** broad-brush visualizations.

![react](https://img.shields.io/badge/React-18-61DAFB)
![ts](https://img.shields.io/badge/TypeScript-5-3178C6)
![vite](https://img.shields.io/badge/Vite-6-646CFF)
![license](https://img.shields.io/badge/license-MIT-green)

---

## What is this?

**Wargames** is a single-page, **client-side** web app that recreates the *feel* of the
classic film's supercomputer and NORAD command center with modern web tech. There is **no
backend, no database, and no account** — it's a deterministic, self-contained simulation you
can run locally or from Docker.

## Scenes

| Scene           | What you get                                                                 |
| --------------- | ---------------------------------------------------------------------------- |
| **Boot**         | Cold-boot diagnostics and a "press any key" prompt.                          |
| **Terminal**     | A full JOSHUA terminal — type `HELP`, `NORAD`, `GTW`, `WOPR`, and more.      |
| **WOPR**         | The self-aware AI cabinet with animated core telemetry (temp / load / games). |
| **NORAD**        | The eight-screen display wall with live missile traffic over a world map.    |
| **GTW Planner**  | Pick a side and launch/target regions, then run a controlled exchange.       |
| **Final Sim**    | Full escalation — DEFCON climbs, the sky fills, then mutual disarmament.     |
| **Tictactoe**    | Challenge JOSHUA. It plays second — and it's unbeatable (minimax).           |

## Map styles

- **Film** *(default)* — the green-on-black, filmic look. **No external assets needed.**
- **Satellite** — NASA *Blue Marble* imagery under the tactical overlay.
- **Hybrid** — imagery blended with the command overlay.
- **Command** — a clean, data-forward ops view.

Switch with the `MAP` terminal command or the on-screen controls.

## Quality

Adaptive **`auto`** detection (cores / memory / GPU heuristics) plus explicit
**`low / medium / high / ultra`** presets that scale the map, the number of wall screens, and
the missile budget. Toggle with `QUALITY`.

---

## Tech stack

- **React 18** + **TypeScript 5**
- **Vite 6** (dev server + production build)
- **Zustand** — lightweight global state
- **Canvas 2D** for the board — **no WebGL required**
- **d3-geo** + **topojson-client** + **world-atlas** — real-world geography & great-circle trajectories
- **Web Audio API** — optional retro sound (off by default)
- **nginx** — production serving via Docker

## Quick start

### Local development

Requires **Node 18+**.

```bash
npm install
npm run dev          # dev server → http://localhost:8080
```

### Production build (no Docker)

```bash
npm run build        # type-check + bundle to dist/
npm run preview      # serve the build → http://localhost:8080
```

### Docker (recommended)

```bash
docker compose up --build -d    # build + run → http://localhost:8080
docker compose logs -f web      # follow logs
docker compose ps               # status & health
docker compose down             # stop & remove
```

The image is a two-stage build: **`node:20-alpine`** compiles the app, then **`nginx:alpine`**
serves the static bundle on **port 8080** with SPA routing, gzip, and long-lived asset caching.

---

## How to play

The whole experience speaks through **one persistent WOPR console** — the
green-on-black terminal from the film. WOPR *types* its replies character by
character (with the classic teletype key-clack when sound is on), and you
reply by **typing**. There are no on-screen button bars — the conversation is
the interface.

1. **Boot** — press any key.
2. **Games menu** — WOPR asks `SHALL WE PLAY A GAME?` and lists the games.
   Pick by typing a number or name (`2`, `GTW`) — or click a row. WOPR answers
   `FINE.` and opens it.
3. **Play** — every scene is driven by the console (commands below). `ESC`
   returns to the terminal from anywhere; each return wipes the console and
   WOPR re-presents the games menu fresh. `HELP` re-shows the menu and the
   commands valid in the current scene.

### Scene commands

| Scene         | Commands |
| ------------- | -------- |
| **Terminal**  | `1`–`6` or game name · `STATUS` · `SOUND` · `CRT` · `MAP` · `QUALITY` · `SURRENDER` · `RESET` |
| **NORAD**     | `FINAL` · `STATUS` · `TERMINAL` · `ESC` |
| **GTW**       | `US` / `USSR` · `TARGET ALL` · `CLEAR` · `LAUNCH` · `STAND-BY` · `ESC` |
| **Final sim** | `RESET` (stand down) · `NORAD` · `ESC` |
| **Tic-tac-toe** | `1`–`9` (play a cell) · `AGAIN` · `TERMINAL` · `ESC` |
| **WOPR**      | `NORAD` · `STATUS` · `TERMINAL` · `ESC` |

Global commands that work everywhere: `HELP`, `STATUS`, `TERMINAL`, `SOUND`,
`CRT`, `MAP`, `QUALITY`, and `ESC`.

## Project structure

```
.
├── public/assets/         # Blue Marble satellite textures (maps/) + asset dirs
├── deploy/nginx.conf      # nginx server config (port 8080, SPA, caching)
├── src/
│   ├── audio/             # Web Audio beeps/chirps
│   ├── components/        # CrtOverlay, useBoardHud
│   ├── data/              # boot lines, regions, scenarios (fictional)
│   ├── maps/              # the board: BigBoard + base/satellite/dynamic/panels + engines
│   ├── scenes/            # Boot, Terminal, Wopr, Norad, Gtw, Final, Tictactoe, StageControls
│   ├── state/             # Zustand store + quality presets
│   ├── styles/            # tokens / global / crt / scenes CSS
│   └── utils/             # rng, math, format, dom
├── Dockerfile             # multi-stage build (node → nginx)
├── docker-compose.yml     # service on port 8080
└── vite.config.ts
```

## Scripts

| Script            | Description                                     |
| ----------------- | ----------------------------------------------- |
| `npm run dev`      | Start the Vite dev server on port 8080.         |
| `npm run build`    | Type-check (`tsc -b`) and build to `dist/`.     |
| `npm run preview`  | Serve the production build on port 8080.        |

---

## Notes & content

- **Fictional data.** All target regions, force data, and event timelines are broad-brush
  cinematic visualizations for a tribute — **not** real or current military information.
- **Paraphrased text.** Narrative strings are reworded; only short, iconic phrases appear.
- **Satellite view.** The NASA *Blue Marble* equirectangular textures are committed under
  `public/assets/maps/` (public domain), so **satellite** and **hybrid** modes work out of
  the box. Swap in a different Blue Marble JPEG (NASA Visible Earth / USGS) at the same path
  to change the imagery; `npm run assets` re-fetches them.

## Disclaimer

This project is a non-commercial **fan work** created for educational and entertainment
purposes. *WarGames*, WOPR, Joshua, and related characters and marks are the property of
their respective owners. This project is **not** endorsed by or affiliated with them.

## License

MIT — see the [`LICENSE`](LICENSE) file. Copyright (c) 2026 mgossman71.