export type QualityLevel = 'auto' | 'low' | 'medium' | 'high' | 'ultra'

/** Concrete quality levels (AUTO is a separate auto-detect mode, not a fixed level). */
export const QUALITY_LEVELS: QualityLevel[] = ['low', 'medium', 'high', 'ultra']

export interface QualityPreset {
  label: string
  /** canvas detail multiplier for the big board (1 = base) */
  boardScale: number
  /** hard cap on simultaneous trajectories on the board */
  missileCap: number
  /** number of tactical sub-screens rendered in full detail */
  screenCount: number
  /** radar / particle density multiplier */
  particles: number
  /** phosphor bloom / glow multiplier */
  bloom: number
  /** number of NORAD consoles rendered in detail */
  consoles: number
  /** max DPR for board canvases */
  dprCap: number
}

const PRESETS: Record<Exclude<QualityLevel, 'auto'>, QualityPreset> = {
  low: {
    label: 'LOW',
    boardScale: 0.7,
    missileCap: 60,
    screenCount: 4,
    particles: 0.5,
    bloom: 0.7,
    consoles: 4,
    dprCap: 1,
  },
  medium: {
    label: 'MEDIUM',
    boardScale: 0.9,
    missileCap: 140,
    screenCount: 6,
    particles: 0.8,
    bloom: 0.85,
    consoles: 6,
    dprCap: 1.5,
  },
  high: {
    label: 'HIGH',
    boardScale: 1.0,
    missileCap: 320,
    screenCount: 8,
    particles: 1.0,
    bloom: 1.0,
    consoles: 8,
    dprCap: 2,
  },
  ultra: {
    label: 'ULTRA',
    boardScale: 1.15,
    missileCap: 600,
    screenCount: 10,
    particles: 1.4,
    bloom: 1.2,
    consoles: 10,
    dprCap: 2.5,
  },
}

export function resolvePreset(level: QualityLevel): QualityPreset {
  if (level !== 'auto') return PRESETS[level]
  return PRESETS[autoDetect()]
}

export function autoDetect(): Exclude<QualityLevel, 'auto'> {
  if (typeof window === 'undefined') return 'medium'
  let score = 0
  const cores = navigator.hardwareConcurrency || 4
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 8
  if (cores >= 8) score += 2
  else if (cores >= 4) score += 1
  if (mem >= 8) score += 1
  if (mem >= 16) score += 1
  const isMobile = /Mobi|Android|iPhone|iPad|iPadSim/i.test(navigator.userAgent)
  const small = Math.min(window.screen.width, window.screen.height) < 768
  if (isMobile || small) score = Math.min(score, 1)

  // crude GPU probe
  try {
    const c = document.createElement('canvas')
    const gl = (c.getContext('webgl') || c.getContext('experimental-webgl')) as WebGLRenderingContext | null
    if (gl) {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info')
      const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : ''
      if (/apple m[1234]|apple m\d|radeon rx (7|8)|rtx|radeon rx 6\d\d/i.test(renderer)) score += 2
      else if (/apple gpu|apple m/i.test(renderer)) score += 1
      else if (/swiftshader|software|llvmpipe/i.test(renderer)) score = 0
    }
  } catch {
    /* ignore */
  }

  if (score <= 0) return 'low'
  if (score <= 2) return 'medium'
  if (score <= 4) return 'high'
  return 'ultra'
}
