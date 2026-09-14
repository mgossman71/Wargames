import type { Region } from '../data/regions'
import type { Scenario, LaunchStyle } from '../data/scenarios'
import type { LngLat } from './geography'
import { greatCircle } from './geography'
import { mulberry32, pick, type RNG } from '../utils/rng'
import { clamp } from '../utils/math'

export type Side = 'us' | 'ussr'
export type TrajState = 'pending' | 'launch' | 'flight' | 'impact' | 'dead'

export interface Trajectory {
  id: number
  from: LngLat
  to: LngLat
  side: Side
  pts: LngLat[]
  t: number
  speed: number
  state: TrajState
  launchFlash: number
  width: number
  number: string
  seed: number
}

export interface Impact {
  pos: LngLat
  age: number
  life: number
  big: boolean
}

const SAMPLES = 46

let nextId = 1

function scatter(rng: RNG, region: Region, style: LaunchStyle, isOrigin: boolean): LngLat {
  let lng = region.lng + (rng() * 2 - 1) * region.spread
  let lat = region.lat + (rng() * 2 - 1) * region.spread * 0.85
  if (isOrigin) {
    if (style === 'polar') lat = clamp(Math.max(lat, 62) + (rng() - 0.5) * 14, 55, 82)
    if (style === 'submarine') lat = clamp(lat, 18, 58)
    if (style === 'regional') lat = clamp(lat, 34, 62)
  }
  return [clamp(lng, -180, 180), clamp(lat, -85, 85)]
}

export class MissileEngine {
  trajectories: Trajectory[] = []
  impacts: Impact[] = []
  rng: RNG
  totalSpawned = 0
  totalImpacted = 0
  /** 0..1 — how fast trajectories fly (escalation) */
  pace = 0.5

  constructor(seed = Date.now()) {
    this.rng = mulberry32(seed)
  }

  clear() {
    this.trajectories = []
    this.impacts = []
    this.totalSpawned = 0
    this.totalImpacted = 0
  }

  get active() {
    return this.trajectories.filter(
      (t) => t.state === 'launch' || t.state === 'flight',
    ).length
  }

  /** Spawn a batch sized by a scenario, respecting a hard cap. */
  spawnBatch(
    scenario: Scenario,
    cap: number,
    paceScale = 1,
  ): Trajectory[] {
    const existing = this.trajectories.length
    let count = Math.min(scenario.count, cap - existing)
    if (count < 2) count = Math.min(6, cap - existing)
    const created: Trajectory[] = []
    for (let i = 0; i < count; i++) {
      const launchRegion = pick(this.rng, scenario.launchRegions.map(idToRegion))
      const targetRegion = pick(this.rng, scenario.targetRegions.map(idToRegion))
      const from = scatter(this.rng, launchRegion, scenario.style, true)
      const to = scatter(this.rng, targetRegion, scenario.style, false)
      const side: Side = launchRegion.side
      const pts = greatCircle(from, to, SAMPLES)
      const baseSpeed = 0.10 + scenario.heat * 0.12
      const tr: Trajectory = {
        id: nextId++,
        from,
        to,
        side,
        pts,
        t: -this.rng() * 0.6, // staggered launch (negative = pending)
        speed: (baseSpeed + this.rng() * 0.05) * paceScale,
        state: 'pending',
        launchFlash: 0,
        width: 1 + this.rng() * 1.6,
        number: 'TRK-' + String(1000 + Math.floor(this.rng() * 8999)),
        seed: this.rng(),
      }
      this.trajectories.push(tr)
      created.push(tr)
    }
    this.totalSpawned += count
    return created
  }

  /** Ambient "cold-war tension" trickle for the NORAD idle state. */
  ambientTick(dt: number, cap: number) {
    if (this.trajectories.length < 6 && this.rng() < dt * 1.5) {
      const fake = SCENARIOS_AMBIENT
      this.spawnBatch(fake, cap, 0.8)
    }
  }

  update(dt: number) {
    const speedMul = 0.6 + this.pace * 2.4
    for (const tr of this.trajectories) {
      if (tr.state === 'pending') {
        tr.t += dt * tr.speed
        if (tr.t >= 0) {
          tr.state = 'launch'
          tr.t = 0
          tr.launchFlash = 1
        }
        continue
      }
      if (tr.state === 'launch' || tr.state === 'flight') {
        tr.state = 'flight'
        tr.launchFlash = Math.max(0, tr.launchFlash - dt * 3)
        tr.t += dt * tr.speed * speedMul
        if (tr.t >= 1) {
          tr.t = 1
          tr.state = 'impact'
          this.impacts.push({
            pos: tr.to,
            age: 0,
            life: 0.9 + this.rng() * 0.6,
            big: this.rng() > 0.5,
          })
          this.totalImpacted++
        }
      }
    }
    // impacts decay
    for (const im of this.impacts) im.age += dt
    this.impacts = this.impacts.filter((im) => im.age < im.life)
    // drop dead trajectories (impacted + faded) to bound memory
    this.trajectories = this.trajectories.filter(
      (tr) => !(tr.state === 'impact' && tr.launchFlash <= 0),
    )
    if (this.impacts.length > 400) this.impacts.splice(0, this.impacts.length - 400)
  }
}

function idToRegion(id: string): Region {
  const r = REGIONS_LOOKUP.get(id)
  if (!r) throw new Error('unknown region ' + id)
  return r
}

// avoid circular import weight: build a lookup from regions
import { REGIONS } from '../data/regions'
const REGIONS_LOOKUP = new Map(REGIONS.map((r) => [r.id, r]))

const SCENARIOS_AMBIENT: Scenario = {
  name: 'TENSION',
  code: 'AMB',
  from: ['ussr', 'us'],
  launchRegions: ['su-north', 'us-west'],
  targetRegions: ['us-east', 'su-west'],
  style: 'polar',
  count: 3,
  heat: 0.4,
}
