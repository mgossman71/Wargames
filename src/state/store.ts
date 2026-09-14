import { create } from 'zustand'
import type { QualityLevel } from './quality'

export type Mode =
  | 'boot'
  | 'terminal'
  | 'wopr'
  | 'norad'
  | 'gtw'
  | 'final'
  | 'tictactoe'
  | 'consoles'

export type CrtLevel = 'off' | 'low' | 'film' | 'heavy'
export type MapMode = 'film' | 'satellite' | 'hybrid' | 'command'
export type GtwSide = 'us' | 'ussr'
export type SimPhase = 'idle' | 'escalating' | 'climax' | 'resolving' | 'done'

export interface WoprStatus {
  coreTemp: number
  load: number
  gamesTrained: number
  hours: number
  defcon: number
}

interface AppState {
  mode: Mode
  previousMode: Mode
  crt: CrtLevel
  sound: boolean
  volume: number
  quality: QualityLevel
  mapMode: MapMode
  defcon: number
  gtwSide: GtwSide
  gtwRegions: string[]
  simPhase: SimPhase
  finalSpeed: number
  wopr: WoprStatus

  // actions
  go: (mode: Mode) => void
  back: () => void
  set: <K extends keyof AppState>(key: K, value: AppState[K]) => void
  setCrt: (c: CrtLevel) => void
  cycleCrt: () => void
  toggleSound: () => void
  setVolume: (v: number) => void
  setQuality: (q: QualityLevel) => void
  cycleQuality: () => void
  setMapMode: (m: MapMode) => void
  cycleMapMode: () => void
  setDefcon: (d: number) => void
  setGtwSide: (s: GtwSide) => void
  toggleRegion: (r: string) => void
  clearRegions: () => void
  setSimPhase: (p: SimPhase) => void
  setFinalSpeed: (n: number) => void
  tickWopr: (dt: number) => void
  reset: () => void
}

const initial = {
  mode: 'boot' as Mode,
  previousMode: 'terminal' as Mode,
  crt: 'film' as CrtLevel,
  sound: false,
  volume: 0.6,
  quality: 'auto' as QualityLevel,
  mapMode: 'film' as MapMode,
  defcon: 5,
  gtwSide: 'us' as GtwSide,
  gtwRegions: [] as string[],
  simPhase: 'idle' as SimPhase,
  finalSpeed: 1,
  wopr: {
    coreTemp: 41,
    load: 12,
    gamesTrained: 43,
    hours: 412.6,
    defcon: 5,
  } as WoprStatus,
}

export const useApp = create<AppState>((set, get) => ({
  ...initial,

  go: (mode) => set((s) => ({ mode, previousMode: s.mode === mode ? s.previousMode : s.mode })),
  back: () => set((s) => ({ mode: s.previousMode })),
  set: (key, value) => set({ [key]: value } as Partial<AppState>),

  setCrt: (c) => set({ crt: c }),
  cycleCrt: () => {
    const order: CrtLevel[] = ['off', 'low', 'film', 'heavy']
    const i = order.indexOf(get().crt)
    set({ crt: order[(i + 1) % order.length] })
  },
  toggleSound: () => set((s) => ({ sound: !s.sound })),
  setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),
  setQuality: (q) => set({ quality: q }),
  cycleQuality: () => {
    const order: QualityLevel[] = ['auto', 'low', 'medium', 'high', 'ultra']
    const i = order.indexOf(get().quality)
    set({ quality: order[(i + 1) % order.length] })
  },
  setMapMode: (m) => set({ mapMode: m }),
  cycleMapMode: () => {
    const order: MapMode[] = ['film', 'satellite', 'hybrid', 'command']
    const i = order.indexOf(get().mapMode)
    set({ mapMode: order[(i + 1) % order.length] })
  },
  setDefcon: (d) => set({ defcon: Math.max(1, Math.min(5, d)), wopr: { ...get().wopr, defcon: d } }),
  setGtwSide: (side) => set({ gtwSide: side, gtwRegions: [] }),
  toggleRegion: (r) =>
    set((s) => ({
      gtwRegions: s.gtwRegions.includes(r)
        ? s.gtwRegions.filter((x) => x !== r)
        : [...s.gtwRegions, r],
    })),
  clearRegions: () => set({ gtwRegions: [] }),
  setSimPhase: (p) => set({ simPhase: p }),
  setFinalSpeed: (n) => set({ finalSpeed: n }),
  tickWopr: (dt) =>
    set((s) => {
      const load = clamp01(s.wopr.load + (Math.random() - 0.48) * dt * 6) * 100
      const temp = s.wopr.coreTemp + (Math.random() - 0.5) * dt * 0.4
      return {
        wopr: {
          ...s.wopr,
          load: Math.max(6, Math.min(98, load)),
          coreTemp: Math.max(38, Math.min(84, temp)),
          hours: s.wopr.hours + dt / 3600,
        },
      }
    }),
  reset: () => set({ ...initial }),
}))

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v
}
