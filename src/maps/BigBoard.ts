import type { MapMode } from '../state/store'
import { resolvePreset, autoDetect, type QualityLevel } from '../state/quality'
import { PALETTES, WALL, type ScreenDef } from './mapStyles'
import { renderGeoBase } from './boardBase'
import { drawMissileLayer, type SegmentCache } from './boardDynamic'
import { drawRadar, drawForces, drawDetection } from './boardPanels'
import { drawScreenFrame, drawHeader } from './boardChrome'
import { MissileEngine } from './missileEngine'
import { loadBlueMarble } from './satelliteLoader'
import type { Rect, Hud, Detection } from './boardGeo'
import { mulberry32, type RNG } from '../utils/rng'
import { clamp } from '../utils/math'
import { simInit, simTick, phaseInfo, type Sim, type SimPhase } from './boardTimeline'
import { SCENARIOS } from '../data/scenarios'

type Canvas2D = CanvasRenderingContext2D

const RASTER = new Set<MapMode>(['satellite', 'command'])
const effectiveScreens = (mode: MapMode): ScreenDef[] =>
  WALL.map((s) => (RASTER.has(mode) && s.kind === 'globe' ? { ...s, kind: 'world' as const } : s))

export type BoardPhase = SimPhase
export interface BoardCallbacks {
  onPhase?: (phase: BoardPhase, label: string) => void
  onHud?: (hud: Hud) => void
}

export class BigBoard {
  private container: HTMLElement
  private base: HTMLCanvasElement
  private phosphor: HTMLCanvasElement
  private chrome: HTMLCanvasElement
  private baseCtx!: Canvas2D
  private dynCtx!: Canvas2D
  private chromeCtx!: Canvas2D

  mode: MapMode = 'film'
  sat: { img: HTMLImageElement } | null = null
  screens: ScreenDef[] = effectiveScreens('film')
  rects: Rect[] = []
  private w = 0
  private h = 0
  private dpr = 1

  engine = new MissileEngine()
  sim: Sim = simInit()
  simulating = false
  private paused = false
  private lastPhaseLabel = ''

  private feed: string[] = []
  private detections: Detection[] = []
  private rng: RNG = mulberry32((Date.now() % 100000) + 7)
  private cache: SegmentCache = new Map()
  private raf = 0
  private last = 0
  private time = 0
  private frame = 0
  private ro: ResizeObserver | null = null
  private cb: BoardCallbacks
  private maxMissiles = 140
  private tier: 'low' | 'medium' | 'high' | 'ultra' = 'medium'
  private dprCap = 2
  private bloom = 1

  constructor(container: HTMLElement, cb: BoardCallbacks = {}) {
    this.container = container
    this.cb = cb
    this.applyTier(autoDetect())
    this.base = this.makeCanvas()
    this.phosphor = this.makeCanvas()
    this.chrome = this.makeCanvas()
    this.baseCtx = this.base.getContext('2d')!
    this.dynCtx = this.phosphor.getContext('2d')!
    this.chromeCtx = this.chrome.getContext('2d')!
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(container)
    this.resize()
    loadBlueMarble()
      .then((s) => {
        this.sat = s
        this.renderBase()
      })
      .catch(() => undefined)
    this.last = performance.now()
    this.raf = requestAnimationFrame(this.tick)
  }

  private makeCanvas() {
    const c = document.createElement('canvas')
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'
    this.container.appendChild(c)
    return c
  }

  private resize() {
    const w = Math.max(320, this.container.clientWidth)
    const h = Math.max(240, this.container.clientHeight)
    this.dpr = Math.min(window.devicePixelRatio || 1, this.dprCap)
    this.w = w
    this.h = h
    for (const c of [this.base, this.phosphor, this.chrome]) {
      c.width = Math.round(w * this.dpr)
      c.height = Math.round(h * this.dpr)
    }
    this.layout()
    this.cache.clear()
    this.renderBase()
  }

  private layout() {
    const headerH = 34
    const gap = 10
    let cols = 4
    let rows = 2
    let pick = [0, 1, 2, 3, 4, 5, 6, 7]
    if (this.w < 620) {
      cols = 2
      rows = 3
      pick = [0, 1, 2, 5, 6, 7]
    }
    const all = this.screens
    const screens: ScreenDef[] = []
    const rects: Rect[] = []
    const cellW = (this.w - gap * (cols + 1)) / cols
    const cellH = (this.h - headerH - gap * (rows + 1)) / rows
    pick.forEach((idx, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      screens.push(all[idx])
      rects.push({ x: gap + col * (cellW + gap), y: headerH + gap + row * (cellH + gap), w: cellW, h: cellH })
    })
    this.screens = screens
    this.rects = rects
  }

  private renderBase() {
    const ctx = this.baseCtx
    const palette = PALETTES[this.mode]
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.fillStyle = palette.bg
    ctx.fillRect(0, 0, this.w, this.h)
    this.screens.forEach((s, i) => {
      const r = this.rects[i]
      if (s.kind === 'radar' || s.kind === 'forces' || s.kind === 'detection') {
        ctx.fillStyle = palette.bg2
        ctx.fillRect(r.x, r.y, r.w, r.h)
        return
      }
      renderGeoBase(ctx, s, r, palette, this.mode, this.sat)
    })
  }

  private tick = (now: number) => {
    this.raf = requestAnimationFrame(this.tick)
    const dt = clamp((now - this.last) / 1000, 0, 0.05)
    this.last = now
    if (this.paused) return
    this.time += dt
    this.frame++
    this.update(dt)
    const skip = this.tier === 'low' && (this.frame & 1) === 1
    if (!skip) this.renderDynamic()
    this.renderChrome()
  }

  private update(dt: number) {
    this.engine.pace = this.simulating ? phaseInfo(this.sim).pace : 0.3
    if (this.simulating) {
      simTick(this.sim, dt, (name, n) => this.spawn(name, n))
      const label = phaseInfo(this.sim).label
      if (label !== this.lastPhaseLabel) {
        this.lastPhaseLabel = label
        this.cb.onPhase?.(this.sim.phase, label)
      }
    } else if (this.engine.trajectories.length < 10) {
      this.engine.ambientTick(dt, 12)
    }
    this.engine.update(dt)
    this.updateDetections(dt)
    this.updateFeed()
  }

  private renderDynamic() {
    const ctx = this.dynCtx
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    drawMissileLayer(
      ctx,
      this.screens,
      this.rects,
      this.mode,
      PALETTES[this.mode],
      this.engine.trajectories,
      this.engine.impacts,
      this.cache,
      this.time,
    )
  }

  private renderChrome() {
    const ctx = this.chromeCtx
    const palette = PALETTES[this.mode]
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.clearRect(0, 0, this.w, this.h)
    const hud = this.buildHud()
    this.screens.forEach((s, i) => {
      const r = this.rects[i]
      if (s.kind === 'radar') drawRadar(ctx, s, r, palette, hud, this.time)
      else if (s.kind === 'forces') drawForces(ctx, s, r, palette, hud, this.time)
      else if (s.kind === 'detection') drawDetection(ctx, s, r, palette, hud, this.time)
      drawScreenFrame(ctx, s, r, palette, this.time)
    })
    drawHeader(ctx, this.w, palette, hud, this.time)
    if (this.frame % 30 === 0) this.cb.onHud?.(hud)
  }

  setMapMode(mode: MapMode) {
    if (mode === this.mode) return
    this.mode = mode
    this.screens = effectiveScreens(mode)
    this.layout()
    this.cache.clear()
    this.renderBase()
  }
  applyTier(t: 'low' | 'medium' | 'high' | 'ultra') {
    this.tier = t
    const p = resolvePreset(t)
    this.maxMissiles = p.missileCap
    this.dprCap = p.dprCap
    this.bloom = p.bloom
  }
  setQualityLevel(level: QualityLevel) {
    const t = level === 'auto' ? autoDetect() : level
    this.applyTier(t)
    this.resize()
  }

  pause() {
    this.paused = true
  }
  resume() {
    this.paused = false
    this.last = performance.now()
  }
  destroy() {
    cancelAnimationFrame(this.raf)
    this.ro?.disconnect()
    this.base.remove()
    this.phosphor.remove()
    this.chrome.remove()
  }
  getHud(): Hud {
    return this.buildHud()
  }

  private lastImpacted = 0
  private lastFeedTime = 0

  isSimulating() {
    return this.simulating
  }

  startFinalSimulation() {
    this.engine.clear()
    this.feed = []
    this.detections = []
    this.lastImpacted = 0
    this.sim = { phase: 'alert', t: 0, done: false, fired: {} }
    this.simulating = true
    this.lastPhaseLabel = ''
    this.pushFeed('>> FINAL SIMULATION INITIATED // WOPR CONTROLLED')
    this.pushFeed('>> "WARS GAMES ARE FOR STUPID PEOPLE."')
  }

  runExchange() {
    this.simulating = false
    this.spawn('U.S. / USSR ESCALATION', Math.min(140, this.maxMissiles))
  }

  reset() {
    this.engine.clear()
    this.sim = { phase: 'idle', t: 0, done: false, fired: {} }
    this.simulating = false
    this.feed = []
    this.detections = []
    this.lastImpacted = 0
    this.lastPhaseLabel = ''
    this.pushFeed('>> SYSTEM RESET // STANDBY')
  }

  private spawn(name: string, n: number) {
    const scenario =
      SCENARIOS.find((s) => s.name === name) ??
      SCENARIOS.find((s) => s.name === 'U.S. / USSR ESCALATION') ??
      SCENARIOS[0]
    if (this.engine.trajectories.length >= this.maxMissiles) return
    this.engine.spawnBatch(scenario, this.maxMissiles, this.simulating ? 0.9 : 1)
    this.pushFeed(`>> ${scenario.name.toUpperCase()} // ${n} OBJECTS LAUNCHED`)
  }

  private pushFeed(line: string) {
    this.feed.push(line)
    if (this.feed.length > 60) this.feed.splice(0, this.feed.length - 60)
  }

  private updateDetections(dt: number) {
    const active = this.engine.active
    for (const d of this.detections) d.age += dt
    this.detections = this.detections.filter((d) => d.age < 6)
    const rate = active > 0 ? 0.6 + active * 0.01 : 0.25
    if (this.rng() < dt * rate && this.detections.length < 60) {
      const side = this.rng() > 0.5 ? 'ussr' : 'us'
      this.detections.push({
        x: 0.5 + (this.rng() * 2 - 1) * 0.42,
        y: 0.5 + (this.rng() * 2 - 1) * 0.42,
        side,
        age: 0,
      })
    }
  }

  private updateFeed() {
    const impacted = this.engine.totalImpacted
    if (impacted !== this.lastImpacted && this.time - this.lastFeedTime > 0.35) {
      this.lastImpacted = impacted
      this.lastFeedTime = this.time
      const hostile = this.rng() > 0.5
      const regions = hostile
        ? ['SU-NORTH', 'SU-WEST', 'SU-MEAN', 'SU-MALAY', 'SU-INDIA', 'SU-BAHRAIN']
        : ['US-WEST', 'US-EAST', 'US-ALASKA', 'US-HAWAII', 'US-GULF', 'US-CARIB']
      const region = regions[(this.rng() * regions.length) | 0]
      const id = 'OBJ-' + (1000 + ((this.rng() * 8999) | 0))
      this.pushFeed(`${hostile ? 'HOSTILE' : 'FRIENDLY'} INTERCEPT @ ${region} // ${id}`)
    }
  }

  private buildHud(): Hud {
    const info = this.simulating
      ? phaseInfo(this.sim)
      : { defcon: 5, pace: 0.2, status: 'STANDBY // NO HOSTILE ACTIVITY', usRead: 97, suRead: 96, label: 'STANDBY' }
    let us = 0
    let su = 0
    for (const t of this.engine.trajectories) {
      if (t.state === 'flight' || t.state === 'launch') {
        if (t.side === 'us') us++
        else su++
      }
    }
    const now = new Date()
    return {
      defcon: info.defcon,
      clock: now.toISOString().slice(11, 19),
      date: now.toISOString().slice(0, 10),
      phase: this.simulating ? this.sim.phase : 'idle',
      status: info.status,
      usObjects: us,
      suObjects: su,
      totalActive: us + su,
      intercepted: this.engine.totalImpacted,
      usReadiness: Math.round(info.usRead),
      suReadiness: Math.round(info.suRead),
      feed: this.feed.slice(-40),
      detections: this.detections,
    }
  }
}
