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

1. **Boot** — press any key.
2. **Terminal** — type `HELP` to see all commands.
3. **NORAD** — watch the display wall and live object tracking.
4. **GTW** — choose a side and regions, then run a controlled exchange.
5. **Final simulation** — `FINAL` (or the on-screen button) and watch it resolve.
6. **Tictactoe** — take on JOSHUA.

### Terminal commands

| Command        | Aliases                          | Effect                                   |
| -------------- | -------------------------------- | ---------------------------------------- |
| `HELP`         | `?`, `h`                         | List available commands.                 |
| `STATUS`       | `stat`                           | DEFCON, core temp, load, mode, quality.  |
| `NORAD`        | `n`                              | Open the NORAD display wall.             |
| `WOPR`         | `machine`                        | View the WOPR cabinet.                   |
| `GTW`          | `war`, `thermonuclear`           | Open the GTW planner.                    |
| `FINAL`        | `play`, `start`, `simulation`    | Run the automatic final simulation.      |
| `TICTACTOE`    | `tictac`, `tic`, `game`          | Start a game (you play second… it wins). |
| `MAP`          | —                                | Cycle the display style.                 |
| `CRT`          | —                                | Cycle the CRT/scanline effect.           |
| `SOUND`        | —                                | Toggle retro audio on/off.               |
| `QUALITY`      | —                                | Cycle the quality preset.                |
| `SURRENDER`    | `abort`                          | Abort the exchange and reset.            |
| `RESET`        | `clear`                          | Full system reset.                       |

## Project structure

```
.
├── public/assets/         # Blue Marble + audio + textures (large images git-ignored)
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
- **Satellite textures are git-ignored** (`public/assets/maps/*.jpg|*.png`) to keep the repo
  light. The app is fully functional without them (default **film** mode). For a real
  **satellite** view, place a NASA *Blue Marble* JPEG at
  `public/assets/maps/blue_marble_next_gen_3600.jpg` before building (public domain — e.g.
  NASA Visible Earth / USGS). `npm run assets` is the fetcher for these.

## Disclaimer

This project is a non-commercial **fan work** created for educational and entertainment
purposes. *WarGames*, WOPR, Joshua, and related characters and marks are the property of
their respective owners. This project is **not** endorsed by or affiliated with them.

## License

MIT — see the [`LICENSE`](LICENSE) file. Copyright (c) 2026 mgossman71.