import { geoPath, geoGraticule10 } from 'd3-geo'
import { COUNTRIES, LAND } from './geography'
import type { Palette, ScreenDef } from './mapStyles'
import type { MapMode } from '../state/store'
import { makeProjection, roundedClip, p2d, type Rect, type SatelliteSource } from './boardGeo'

function isGlobe(kind: ScreenDef['kind']) {
  return kind === 'globe' || kind === 'polar'
}

export function drawSatelliteScreen(
  ctx: CanvasRenderingContext2D,
  sat: SatelliteSource,
  screen: ScreenDef,
  rect: Rect,
  palette: Palette,
  mode: MapMode,
) {
  const img = sat.img
  const iw = img.naturalWidth
  const ih = img.naturalHeight
  let minLng: number
  let maxLng: number
  let minLat: number
  let maxLat: number
  if (screen.kind === 'world') {
    minLng = -180
    maxLng = 180
    const aspect = rect.w / rect.h
    const dLat = Math.min(178, 360 / (aspect * 2))
    const clat = screen.center[1]
    maxLat = Math.min(89, clat + dLat / 2)
    minLat = Math.max(-89, clat - dLat / 2)
  } else {
    const clng = screen.center[0]
    const clat = screen.center[1]
    const dLng = screen.kind === 'us' ? 70 : 120
    const aspect = rect.w / rect.h
    const dLat = dLng / (aspect * 2)
    minLng = clng - dLng / 2
    maxLng = clng + dLng / 2
    minLat = Math.max(-85, clat - dLat / 2)
    maxLat = Math.min(85, clat + dLat / 2)
  }
  const sx = ((minLng + 180) / 360) * iw
  const sw = ((maxLng - minLng) / 360) * iw
  const sy = ((90 - maxLat) / 180) * ih
  const sh = ((maxLat - minLat) / 180) * ih
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, sx, sy, sw, sh, rect.x, rect.y, rect.w, rect.h)

  if (mode === 'hybrid') {
    ctx.fillStyle = 'rgba(2,10,20,0.42)'
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
  }
  ctx.save()
  roundedClip(ctx, rect)
  const projection = makeProjection(screen.kind, screen.center, screen.zoom, rect)
  const path = geoPath(projection)
  ctx.strokeStyle = palette.border
  ctx.lineWidth = 0.6
  ctx.stroke(p2d(path(COUNTRIES)))
  const graticule = path(geoGraticule10())
  if (graticule) {
    ctx.strokeStyle = 'rgba(255,255,255,0.10)'
    ctx.lineWidth = 0.5
    ctx.stroke(p2d(graticule))
  }
  ctx.restore()
}

export function drawReliefScreen(
  ctx: CanvasRenderingContext2D,
  screen: ScreenDef,
  rect: Rect,
  palette: Palette,
) {
  const globe = isGlobe(screen.kind)
  const projection = makeProjection(screen.kind, screen.center, screen.zoom, rect)
  const path = geoPath(projection)
  ctx.fillStyle = palette.ocean
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
  if (globe) {
    const sphere = path({ type: 'Sphere' })
    const cx = projection.translate()[0]
    const cy = projection.translate()[1]
    const r = projection.scale()
    const oc = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r)
    oc.addColorStop(0, '#20455f')
    oc.addColorStop(1, '#0a1a28')
    ctx.fillStyle = oc
    ctx.fill(p2d(sphere))
  }
  const src = globe ? LAND : COUNTRIES
  const landPath = p2d(path(src))
  ctx.fillStyle = 'rgba(58,74,48,0.92)'
  ctx.fill(landPath)
  ctx.strokeStyle = 'rgba(20,28,18,0.8)'
  ctx.lineWidth = 2.4
  ctx.stroke(landPath)
  ctx.strokeStyle = 'rgba(200,220,180,0.35)'
  ctx.lineWidth = 0.7
  ctx.stroke(landPath)
  if (!globe) {
    ctx.strokeStyle = palette.border
    ctx.lineWidth = 0.5
    ctx.stroke(p2d(path(COUNTRIES)))
  }
}
