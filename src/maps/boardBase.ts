import { geoPath, geoGraticule10 } from 'd3-geo'
import { COUNTRIES, LAND } from './geography'
import type { Palette, ScreenDef } from './mapStyles'
import type { MapMode } from '../state/store'
import { makeProjection, roundedClip, p2d, type Rect, type SatelliteSource } from './boardGeo'
import { drawSatelliteScreen, drawReliefScreen } from './boardSatellite'

function isGlobe(kind: ScreenDef['kind']) {
  return kind === 'globe' || kind === 'polar'
}

function drawGlobe(
  ctx: CanvasRenderingContext2D,
  projection: any,
  path: any,
  rect: Rect,
) {
  const sphere = path({ type: 'Sphere' })
  const cx = projection.translate()[0]
  const cy = projection.translate()[1]
  const r = projection.scale()
  const rim = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r * 1.1)
  rim.addColorStop(0, 'transparent')
  rim.addColorStop(0.88, 'transparent')
  rim.addColorStop(1, 'rgba(87,232,255,0.20)')
  ctx.fillStyle = rim
  ctx.beginPath()
  ctx.arc(cx, cy, r * 1.1, 0, Math.PI * 2)
  ctx.fill()
  const oc = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r)
  oc.addColorStop(0, '#0a2438')
  oc.addColorStop(1, '#020810')
  ctx.fillStyle = oc
  ctx.fill(p2d(sphere))
  ctx.strokeStyle = 'rgba(87,232,255,0.30)'
  ctx.lineWidth = 1
  ctx.stroke(p2d(sphere))
}

/** Draw the base geography for one geographic wall screen. */
export function renderGeoBase(
  ctx: CanvasRenderingContext2D,
  screen: ScreenDef,
  rect: Rect,
  palette: Palette,
  mode: MapMode,
  sat: SatelliteSource | null,
) {
  const globe = isGlobe(screen.kind)
  const showRaster = palette.satellite && !globe
  const showRelief = palette.relief && !globe
  ctx.save()
  roundedClip(ctx, rect)
  const bg = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h)
  bg.addColorStop(0, palette.bg2)
  bg.addColorStop(1, palette.bg)
  ctx.fillStyle = bg
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h)

  if (showRaster && sat) {
    drawSatelliteScreen(ctx, sat, screen, rect, palette, mode)
  } else if (showRelief) {
    drawReliefScreen(ctx, screen, rect, palette)
  } else {
    const projection = makeProjection(screen.kind, screen.center, screen.zoom, rect)
    const path = geoPath(projection)
    const graticule = path(geoGraticule10())
    if (globe) {
      drawGlobe(ctx, projection, path, rect)
    }
    if (graticule) {
      ctx.strokeStyle = palette.graticule
      ctx.lineWidth = 0.5
      ctx.stroke(p2d(graticule))
    }
    if (globe) {
      ctx.fillStyle = palette.landFill
      ctx.fill(p2d(path(LAND)))
      ctx.strokeStyle = palette.landStroke
      ctx.lineWidth = 1.1
      ctx.shadowColor = palette.landStroke
      ctx.shadowBlur = 5
      ctx.stroke(p2d(path(LAND)))
      ctx.shadowBlur = 0
    } else {
      const src = COUNTRIES
      ctx.fillStyle = palette.landFill
      ctx.fill(p2d(path(src)))
      ctx.strokeStyle = palette.border
      ctx.lineWidth = 0.55
      ctx.stroke(p2d(path(src)))
      ctx.strokeStyle = palette.landStroke
      ctx.lineWidth = 1
      ctx.shadowColor = palette.landStroke
      ctx.shadowBlur = 4
      ctx.stroke(p2d(path(src)))
      ctx.shadowBlur = 0
    }
  }
  ctx.restore()
}
