import * as topojson from 'topojson-client'
import { geoPath, geoInterpolate } from 'd3-geo'
import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
  Position,
} from 'geojson'
import countriesTopo from 'world-atlas/countries-50m.json'
import landTopo from 'world-atlas/land-50m.json'

/* eslint-disable @typescript-eslint/no-explicit-any */

type Topo = any

const topo = countriesTopo as unknown as Topo
const land = landTopo as unknown as Topo

/** Natural Earth 1:50m countries — borders + land, geographically accurate. */
export const COUNTRIES: FeatureCollection = topojson.feature(
  topo,
  topo.objects.countries,
) as unknown as FeatureCollection

/** Natural Earth 1:50m land silhouette (no internal borders) — used on globes. */
export const LAND: Feature<MultiPolygon> = topojson.feature(
  land,
  land.objects.land,
) as unknown as Feature<MultiPolygon>

export type LngLat = [number, number]

/**
 * Sample a great-circle arc between two [lng,lat] points.
 * Returns N points along the geodesic (geographically correct path).
 */
const interpolators = new Map<string, (t: number) => LngLat>()
export function greatCircle(from: LngLat, to: LngLat, n: number): LngLat[] {
  const key = from.join(',') + '>' + to.join(',')
  let interp = interpolators.get(key)
  if (!interp) {
    interp = geoInterpolate(from as [number, number], to as [number, number])
    interpolators.set(key, interp)
    if (interpolators.size > 2000) interpolators.clear()
  }
  const pts: LngLat[] = []
  for (let i = 0; i <= n; i++) {
    const p = interp(i / n)
    pts.push([p[0], p[1]])
  }
  return pts
}

/** Build a d3-geo path bound to a canvas 2D context. */
export function canvasGeoPath(
  projection: any,
  ctx: CanvasRenderingContext2D,
): (feature: Feature | FeatureCollection) => void {
  return geoPath(projection, ctx) as unknown as (f: Feature | FeatureCollection) => void
}

/** Equirectangular (plate carrée) linear mapping — used for raster world screens. */
export function equirectMap(
  lng: number,
  lat: number,
  rect: { x: number; y: number; w: number; h: number },
) {
  const x = rect.x + ((lng + 180) / 360) * rect.w
  const y = rect.y + ((90 - lat) / 180) * rect.h
  return [x, y] as const
}

/** Great-circle sample expressed directly in equirectangular screen space. */
export function greatCircleEquirect(
  from: LngLat,
  to: LngLat,
  rect: { x: number; y: number; w: number; h: number },
  n: number = 40,
  bulge = 0.16,
): Array<[number, number]> {
  const pts = greatCircle(from, to, n)
  const a = equirectMap(from[0], from[1], rect)
  const b = equirectMap(to[0], to[1], rect)
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = Math.hypot(dx, dy) || 1
  // perpendicular (screen "up")
  const px = -dy / len
  const py = dx / len
  const out: Array<[number, number]> = []
  for (let i = 0; i < pts.length; i++) {
    const t = i / (pts.length - 1)
    const baseX = equirectMap(pts[i][0], pts[i][1], rect)[0]
    const baseY = equirectMap(pts[i][1], pts[i][1], rect)[1]
    const lift = Math.sin(Math.PI * t) * len * bulge
    out.push([baseX + px * lift * 0.15, baseY - lift])
  }
  return out
}

/** Bounding-box containment used to filter which arcs a regional screen shows. */
export function regionContains(b: { minLng: number; maxLng: number; minLat: number; maxLat: number }, p: LngLat) {
  const [lng, lat] = p
  if (lng < b.minLng || lng > b.maxLng) return false
  if (lat < b.minLat || lat > b.maxLat) return false
  return true
}

export { geoPath }
export type { Position, Polygon }
