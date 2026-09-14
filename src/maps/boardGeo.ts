import {
  geoOrthographic,
  geoMercator,
  geoAzimuthalEquidistant,
  geoEquirectangular,
} from 'd3-geo'
import type { ScreenKind } from './mapStyles'

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Rect = { x: number; y: number; w: number; h: number }
export interface SatelliteSource {
  img: HTMLImageElement
}

export function makeProjection(
  kind: ScreenKind,
  center: [number, number],
  zoom: number,
  rect: Rect,
): any {
  const cx = rect.x + rect.w / 2
  const cy = rect.y + rect.h / 2
  const base = Math.min(rect.w, rect.h)
  const [clng, clat] = center
  switch (kind) {
    case 'globe':
      return geoOrthographic()
        .rotate([clng, clat, 0])
        .translate([cx, cy])
        .scale(base * 0.5 * zoom)
        .clipAngle(90)
    case 'polar':
      return geoAzimuthalEquidistant()
        .rotate([clng, -90, 0])
        .translate([cx, cy])
        .scale(base * 0.42 * zoom)
        .clipAngle(95)
    case 'us':
      return geoMercator()
        .center([clng, clat])
        .scale(base * 0.13 * zoom)
        .translate([cx, cy])
    case 'ussr':
      return geoMercator()
        .center([clng, clat])
        .scale(base * 0.11 * zoom)
        .translate([cx, cy])
    case 'world':
    default:
      return geoEquirectangular()
        .center([clng, clat])
        .scale(base * 0.14 * zoom)
        .translate([cx, cy])
  }
}

export function roundedClip(ctx: CanvasRenderingContext2D, rect: Rect, r = 4) {
  ctx.beginPath()
  ctx.moveTo(rect.x + r, rect.y)
  ctx.arcTo(rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + rect.h, r)
  ctx.arcTo(rect.x + rect.w, rect.y + rect.h, rect.x, rect.y + rect.h, r)
  ctx.arcTo(rect.x, rect.y + rect.h, rect.x, rect.y, r)
  ctx.arcTo(rect.x, rect.y, rect.x + rect.w, rect.y, r)
  ctx.closePath()
  ctx.clip()
}

export function p2d(pathString: string | null | undefined) {
  return new Path2D(pathString ?? '')
}

export interface Detection {
  x: number // 0..1 within radar scope
  y: number // 0..1
  side: 'us' | 'ussr' | 'unknown'
  age: number
}

export interface Hud {
  defcon: number
  clock: string
  date: string
  phase: string
  status: string
  usObjects: number
  suObjects: number
  totalActive: number
  intercepted: number
  usReadiness: number
  suReadiness: number
  feed: string[]
  detections: Detection[]
}

