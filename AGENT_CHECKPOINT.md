# AGENT CHECKPOINT — WarGames (WOPR) interactive experience

> **Purpose:** Handoff/checkpoint file. Read top-to-bottom before touching code.
> **Status: 🟢 BUILD GREEN** — `tsc -b` passes (0 errors), `vite build` succeeds, preview server returns HTTP 200.
> **Repo:** NOT yet committed to git (no commits). Commit after each milestone so this file + code stay durable.

---

## 0. Quick start (verify before changing anything)

```bash
cd /Users/gozz/Documents/WarGames
npx tsc -b                 # must exit 0
npx vite build             # must print "built in ..."
npm run dev                # dev server (http://localhost:5173)
# or
npm run build && npm run preview
```

**Smoke-test flow:** Boot → press → Terminal → type `HELP` → `NORAD` (8-screen wall) → `▶ INITIATE FINAL SIMULATION` → reset.
Other commands: `WOPR`, `GTW`, `TICTACTOE`, `STATUS`, `MAP`, `CRT`, `SOUND`, `QUALITY`, `SURRENDER`.

---

## 1. Goal

An interactive cinematic tribute to *WarGames* (1983): a **WOPR/JOSHUA** terminal + cabinet, a **NORAD** "display wall" (8 synchronized tactical screens), and a **GTW planner** + an automatic **"final simulation"** missile escalation on a real-world map. 1980s CRT aesthetic, high performance (3 layered canvases), no real targeting data (broad fictional regions only).

**Stack:** React 18 + TypeScript, Vite, Zustand (state), d3-geo + topojson-client + world-atlas (geography). Canvas 2D, no game engine.

---

## 2. What's DONE (this checkpoint reflects a green build)

- **Map / "Big Board" engine** `src/maps/` — geography, palettes, 8-screen wall, missile engine, 3-layer canvas rendering, final-sim timeline.
- **State** `src/state/` (Zustand store + quality presets/auto-detect). **Data** `src/data/` (boot lines, regions, scenarios).
- **All scenes** `src/scenes/` + `StageControls`. **Components** `src/components/` (`CrtOverlay`, `useBoardHud`).
- **Entry** `src/App.tsx` (mode→scene routing + board lifecycle) and **`src/main.tsx`** (React root + CSS entry) — both present and working.
- **Audio** `src/audio/index.ts`. **Styles** `src/styles/` (tokens/global/crt/scenes).
- **Reconciliation (most recent session):** fixed every scene↔module import/type mismatch, fixed real map-engine type bugs, added missing exports, created `main.tsx` + `audio`. Verified: tsc 0 errors, vite build OK, preview HTTP 200, satellite texture present.

## 3. KNOWN GAPS / NEXT STEPS (nothing blocks the build or the core flow)

1. **`'consoles'` mode has no scene.** Store `Mode` includes `'consoles'` but `App.tsx` falls through to `TictactoeScene`. No command targets it yet (inert). Decide: build a NORAD "consoles" scene (`QualityPreset.consoles` hints it was intended) **OR** drop `'consoles'` from the `Mode` union.
2. **Dead script.** `package.json` → `"assets": "bash scripts/fetch-public-assets.sh"` but `scripts/` is **empty** (file missing). Assets already exist under `public/assets/`, so non-blocking. Add the script or remove the npm entry.
3. **Possibly-unused store fields:** verify `finalSpeed`/`setFinalSpeed` and `tickWopr(dt)` are actually called; wire them in (e.g. Final Scene sim-speed control / WOPR temp drift) or remove them.
4. **No tests.** Only `tsc` + a manual browser flow. Optional Vitest for pure logic: `missileEngine.update`, `boardTimeline.simTick`, tictactoe winner/minimax, `quality.autoDetect`.
5. **Commit to git** (no commits yet) so progress is durable and diffable.

**Nice-to-haves:** confirm `QualityPreset.boardScale`/`screenCount` are actually consumed by `BigBoard.setQualityLevel`/`applyTier`; add terminal keyboard shortcuts; show a quality indicator reflecting `resolvePreset`'s auto-detected tier.

---

## 4. MODULE MAP + TRUE API SURFACES (audited against disk — trust these)

> ⚠️ Scene files were originally written against *assumed* APIs that didn't match the real modules. They are now reconciled. The signatures below are the **real** ones — don't "fix" them back.

### `src/state/store.ts` (Zustand)
- `Mode = boot | terminal | wopr | norad | gtw | final | tictactoe | consoles`
- `CrtLevel = off|low|film|heavy`; `MapMode = film|satellite|hybrid|command`; `GtwSide = us|ussr`
- `SimPhase = idle|escalating|climax|resolving|done` (UI phase — **not** the board timeline phase)
- `WoprStatus = { coreTemp, load, gamesTrained, hours, defcon }`
- State: `mode, previousMode, crt, sound, volume, quality, mapMode, defcon, gtwSide, gtwRegions: string[], simPhase, finalSpeed, wopr`
- Actions: `go, back, set, setCrt, cycleCrt, toggleSound, setVolume, setQuality, cycleQuality, setMapMode, cycleMapMode, setDefcon, setGtwSide, toggleRegion, clearRegions, setSimPhase, setFinalSpeed, tickWopr, reset`
- `sound` defaults to `false` (audio off until enabled).

### `src/state/quality.ts`
- `QualityLevel = auto|low|medium|high|ultra`; `QUALITY_LEVELS = ['low','medium','high','ultra']` (concrete levels; AUTO is separate)
- `QualityPreset` interface; `resolvePreset(level): QualityPreset`; `autoDetect()` (cores/mem/GPU heuristics)

### `src/maps/mapStyles.ts`
- `Palette`, `PALETTES: Record<MapMode, Palette>`; `ScreenKind`, `ScreenDef`, `WALL` (8 screens)
- `MODE_LABEL: Record<MapMode,string>`, `MAP_MODES = ['film','satellite','hybrid','command']`

### `src/maps/boardGeo.ts`
- `Rect`, `SatelliteSource`, `Detection`
- **`Hud` (what scenes read via `useBoardHud`):**
  `{ defcon, clock, date, phase, status, usObjects, suObjects, totalActive, intercepted, usReadiness, suReadiness, feed: string[], detections: Detection[] }`
  - ⚠️ There is **no** `contacts`/`impacts` — use `totalActive`/`intercepted`.
- `makeProjection`, `roundedClip`, `p2d`

### `src/maps/boardSingleton.ts`
- `getBoard(container): BigBoard` (creates the singleton; wires `onPhase` → store `simPhase`/`defcon`), `boardAvailable(): BigBoard | null`
- `BOARD_MODES = ['norad','gtw','final']`, `isBoardMode(m)`; `PHASE_MAP`: timeline phase → `{ sim: SimPhase, defcon }`

### `src/maps/BigBoard.ts` (public surface only)
- **Public fields:** `mode, sat, screens: ScreenDef[], rects: Rect[], engine: MissileEngine, sim: Sim, simulating: boolean`
- **Public methods:** `setMapMode(mode)`, `applyTier(t)`, `setQualityLevel(level)`, `pause()`, `resume()`, `destroy()`, `getHud(): Hud`, `isSimulating()`, `startFinalSimulation()`, `runExchange()`, `reset()`
- `BoardPhase` (board **timeline**) = `idle|alert|strike|retaliation|exchange|rational|aftermath`
- ⚠️ There is **no** `targetRegion()` / `targetAll()` method. GTW uses `runExchange()` + store state.

### `src/maps/boardTimeline.ts`
- `Sim = { phase, t, done, fired }`; `DUR`, `simInit(): Sim`, `phaseInfo(sim): PhaseInfo`, `simTick(sim, dt, spawn(scenarioName, n))`
- `phaseInfo` drives DEFCON/status/readiness. 'aftermath' status = "MUTUAL DISARMAMENT // THERE IS NO WINNING MOVE" (deliberately paraphrased — **don't** restore the verbatim film quote).

### `src/maps/missileEngine.ts`
- `Side = us|ussr`, `Trajectory`, `Impact`
- `class MissileEngine`: fields `trajectories, impacts, rng, totalSpawned, totalImpacted, pace`; methods `clear()`, `active` (getter), `spawnBatch(scenario, cap, paceScale=1)`, `ambientTick(dt, cap)`, `update(dt)`

### `src/data/regions.ts`
- `Region = { id, label, code, side: us|ussr, lat, lng, spread }`; `REGIONS` (12: 6 US + 6 USSR); `regionsForSide(side): Region[]`
- ⚠️ **No** `GTW_REGIONS` / `Side` export — use `regionsForSide` + `Region['side']`.

### `src/data/scenarios.ts`
- `Scenario = { name, code, from, launchRegions, targetRegions, style, count, heat }`; `SCENARIOS` (12)

### `src/maps/geography.ts`
- `COUNTRIES` (Natural Earth 50m), `LAND`, `LngLat = [number, number]`
- `greatCircle(from, to, n): LngLat[]`, `canvasGeoPath`, `equirectMap`, `greatCircleEquirect`, `regionContains(b, p)`

### `src/audio/index.ts`
- `beep(freq=440, dur=0.12, type='square', gain=0.05)`, `chirp(from=880, to=220, dur=0.5)` — silent unless `store.sound` is true.

### `src/utils/`
- `rng.ts`: `mulberry32(seed)`, `type RNG`, `pick(rng, arr)`; `math.ts`: `clamp(v, min, max)`; `format.ts`, `dom.ts`

## 5. SCENE → MODE ROUTING (`src/App.tsx`)

| mode      | component        | board    |
|-----------|------------------|:--------:|
| `boot`     | `BootScene`       | paused   |
| `terminal` | `TerminalScene`   | paused   |
| `wopr`     | `WoprScene`       | paused   |
| `norad`    | `NoradScene`      | **running** |
| `gtw`      | `GtwScene`        | **running** |
| `final`    | `FinalScene`      | **running** |
| `tictactoe`| `TictactoeScene`  | paused   |
| `consoles` | *(falls through to `TictactoeScene` — see Gaps #1)* | paused |

App creates the board **once** into the always-mounted `.board-root`, then `resume()`/`pause()` based on `BOARD_MODES`, and syncs `mapMode` + `quality` into the board on change.

---

## 6. CONVENTIONS / GOTCHAS

- **No verbatim film dialogue.** Data files + `boardTimeline.ts` use paraphrased lines. Keep it that way.
- **Fictional, broad target regions only.** `regions.ts`/`scenarios.ts` are cinematic visualization, not real force data.
- **CSS entry chain:** `main.tsx` imports `global.css` (which `@import`s `tokens.css`) + `crt.css` + `scenes.css`. Don't import `tokens.css` separately.
- **`geoPath`:** do `const path = geoPath(projection)` → `const d = path(feature)` → `ctx.stroke(p2d(d))`. Passing a geometry as `geoPath`'s 2nd arg is a bug (2nd arg is a *context*).
- **Satellite textures:** loaded from `public/assets/maps/blue_marble_*.jpg` (`satelliteLoader.ts`), used only by `satellite`/`hybrid` modes; `film` is the default and needs no assets.
- **Terminal quirks:** builds/preview run via this shell sometimes leave it "open" and report a heuristic non-zero exit even when the command succeeded — rely on printed output ("built in ...", "TSC_EXIT=0", "HTTP 200") rather than the shell's exit status.

---

## 7. CHANGE LOG (most recent session — API reconciliation + green build)

**Created:** `src/main.tsx` (was missing; `index.html` referenced it); `src/audio/index.ts` (`beep`, `chirp`).

**Fixed (map engine — real type/logic bugs):** `BigBoard.ts` initialized `maxMissiles`; `boardBase.ts`/`boardSatellite.ts` `geoPath(projection, geoGraticule10())` → `path(geoGraticule10())`; `boardDynamic.ts` impact filter no longer passes a `LngLat` to `relevant()` (now `regionContains` bbox check); `boardPanels.ts` safe `createConicGradient` guard.

**Fixed (scene/data alignment):** `mapStyles.ts` added `MAP_MODES`; `quality.ts` added `QUALITY_LEVELS`; `App.tsx` `BOARD_MODES` now from `boardSingleton`; `WoprScene.tsx` removed bad `WoprState` import; `NoradScene.tsx` `hud.contacts/impacts` → `totalActive/intercepted`; `GtwScene.tsx` rewritten (`regionsForSide` + store `gtwSide`/`gtwRegions`/`toggleRegion` + real `runExchange()`); `boardTimeline.ts` paraphrased the one verbatim iconic line.

**Verified:** `tsc -b` 0 errors; `vite build` success (199 modules); `vite preview` HTTP 200 (root/CSS/JS); satellite texture present; no leftover broken references; server port cleaned up.

---

## 8. FILE TREE (source of truth)

```
src/
  App.tsx  main.tsx  vite-env.d.ts
  audio/      index.ts
  components/ CrtOverlay.tsx  useBoardHud.ts
  data/       bootLines.ts  regions.ts  scenarios.ts
  maps/       BigBoard.ts  boardBase.ts  boardChrome.ts  boardDynamic.ts
              boardGeo.ts  boardPanels.ts  boardSatellite.ts  boardSingleton.ts
              boardTimeline.ts  geography.ts  mapStyles.ts  missileEngine.ts
              satelliteLoader.ts
  scenes/     BootScene.tsx  FinalScene.tsx  GtwScene.tsx  NoradScene.tsx
              StageControls.tsx  TerminalScene.tsx  TictactoeScene.tsx  WoprScene.tsx
  state/      quality.ts  store.ts
  styles/     crt.css  global.css  scenes.css  tokens.css
  utils/      dom.ts  format.ts  math.ts  rng.ts
public/assets/{audio,maps,norad,reference,textures,wopr}
scripts/      (empty — see Gaps #2)
```