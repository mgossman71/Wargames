import type { MapMode } from '../state/store'

export interface Palette {
  bg: string
  bg2: string
  ocean: string
  land: string
  landFill: string
  landStroke: string
  border: string
  graticule: string
  friendly: string
  hostile: string
  radar: string
  text: string
  textDim: string
  missileFriendly: string
  missileHostile: string
  missileNeutral: string
  detection: string
  impact: string
  satellite: boolean
  relief: boolean
}

const base = {
  text: '#d7f3ff',
  textDim: '#5c7480',
  radar: '#37e07a',
  detection: '#ffd23e',
  impact: '#ff6b5c',
  missileNeutral: '#eafff3',
}

export const PALETTES: Record<MapMode, Palette> = {
  film: {
    bg: '#01030a',
    bg2: '#020710',
    ocean: '#01040c',
    land: '#061520',
    landFill: 'rgba(8,28,40,0.55)',
    landStroke: '#57e8ff',
    border: 'rgba(87,232,255,0.35)',
    graticule: 'rgba(87,232,255,0.10)',
    friendly: '#46ff8a',
    hostile: '#ff5544',
    missileFriendly: '#46ff8a',
    missileHostile: '#ff5544',
    ...base,
    satellite: false,
    relief: false,
  },
  satellite: {
    bg: '#02050c',
    bg2: '#040a14',
    ocean: '#06152c',
    land: '#0a1a2e',
    landFill: 'transparent',
    landStroke: 'rgba(220,240,255,0.9)',
    border: 'rgba(255,255,255,0.7)',
    graticule: 'rgba(255,255,255,0.12)',
    friendly: '#7dff9e',
    hostile: '#ff6b5c',
    missileFriendly: '#8affa8',
    missileHostile: '#ff7d6d',
    ...base,
    satellite: true,
    relief: false,
  },
  hybrid: {
    bg: '#030810',
    bg2: '#05101c',
    ocean: '#0a1830',
    land: '#0f2236',
    landFill: 'rgba(12,32,52,0.5)',
    landStroke: '#57e8ff',
    border: 'rgba(120,232,255,0.6)',
    graticule: 'rgba(120,232,255,0.14)',
    friendly: '#46ff8a',
    hostile: '#ff5544',
    missileFriendly: '#5cffa0',
    missileHostile: '#ff6a58',
    ...base,
    satellite: true,
    relief: false,
  },
  command: {
    bg: '#05070a',
    bg2: '#0a0e12',
    ocean: '#12283a',
    land: '#2a3a2a',
    landFill: 'rgba(40,54,38,0.85)',
    landStroke: 'rgba(220,235,210,0.85)',
    border: 'rgba(255,210,120,0.7)',
    graticule: 'rgba(255,255,255,0.08)',
    friendly: '#5cff8a',
    hostile: '#ff5a4a',
    missileFriendly: '#6dffa0',
    missileHostile: '#ff6a58',
    ...base,
    satellite: false,
    relief: true,
  },
}

export type ScreenKind =
  | 'globe'
  | 'world'
  | 'us'
  | 'ussr'
  | 'polar'
  | 'radar'
  | 'forces'
  | 'detection'

export interface ScreenDef {
  kind: ScreenKind
  label: string
  sub?: string
  center: [number, number] // [lng, lat]
  zoom: number
  bbox?: { minLng: number; maxLng: number; minLat: number; maxLat: number }
}

/** The NORAD display wall — 8 large synchronized screens. */
export const WALL: ScreenDef[] = [
  { kind: 'globe', label: 'GLOBAL STRIKE ACTIVITY', sub: 'SAT / RADAR CORRELATION', center: [-25, 25], zoom: 1 },
  { kind: 'us', label: 'UNITED STATES', sub: 'DEFENDABLE AREAS', center: [-98, 38], zoom: 1.9, bbox: { minLng: -170, maxLng: -50, minLat: 15, maxLat: 75 } },
  { kind: 'ussr', label: 'SOVIET UNION / EURASIA', sub: 'HOSTILE AREAS', center: [78, 55], zoom: 1.55, bbox: { minLng: 15, maxLng: 180, minLat: 35, maxLat: 78 } },
  { kind: 'globe', label: 'RETALIATION TRACKS', sub: 'SECONDARY WAVES', center: [95, 30], zoom: 1 },
  { kind: 'polar', label: 'POLAR / ARCTIC WATCH', sub: 'HIGH-ALTITUDE LAUNCHES', center: [0, 90], zoom: 1 },
  { kind: 'radar', label: 'EARLY WARNING RADAR', sub: 'PERIMETER SWEEP', center: [0, 45], zoom: 1 },
  { kind: 'forces', label: 'STRATEGIC FORCES', sub: 'READINESS / INTERCEPT', center: [0, 0], zoom: 1 },
  { kind: 'world', label: 'WORLD TACTICAL PLOT', sub: 'INTERCONTINENTAL', center: [0, 25], zoom: 1 },
]

export const MODE_LABEL: Record<MapMode, string> = {
  film: 'FILM DISPLAY',
  satellite: 'SATELLITE',
  hybrid: 'HYBRID',
  command: 'COMMAND MAP',
}

export const MAP_MODES: MapMode[] = ['film', 'satellite', 'hybrid', 'command']
