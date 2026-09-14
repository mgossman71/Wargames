import { makeProjection, roundedClip, type Rect, type Hud } from './boardGeo'
import type { Palette, ScreenDef } from './mapStyles'
import type { MapMode } from '../state/store'
import type { Trajectory, Impact } from './missileEngine'
import { regionContains } from './geography'

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Pts2d = Array<[number, number] | null>
export type SegmentCache = Map<string, Pts2d>

function satBox(
  screen: ScreenDef,
  rect: Rect,
) {
  if (screen.kind === 'world') {
    const aspect = rect.w / rect.h
    const dLat = Math.min(178, 360 / (aspect * 2))
    return {
      minLng: -180,
      maxLng: 180,
      minLat: Math.max(-89, screen.center[1] - dLat / 2),
      maxLat: Math.min(89, screen.center[1] + dLat / 2),
    }
  }
  const clng = screen.center[0]
  const clat = screen.center[1]
  const dLng = screen.kind === 'us' ? 70 : 120
  const aspect = rect.w / rect.h
  const dLat = dLng / (aspect * 2)
  return {
    minLng: clng - dLng / 2,
    maxLng: clng + dLng / 2,
    minLat: Math.max(-85, clat - dLat / 2),
    maxLat: Math.min(85, clat + dLat / 2),
  }
}

export function projectPoint(
  screen: ScreenDef,
  rect: Rect,
  mode: MapMode,
  lng: number,
  lat: number,
): [number, number] | null {
  const isGlobe = screen.kind === 'globe' || screen.kind === 'polar'
  if ((mode === 'satellite' || mode === 'hybrid') && !isGlobe) {
    const b = satBox(screen, rect)
    const x = rect.x + ((lng + 180) / 360) * rect.w
    const y = rect.y + ((90 - lat) / 180) * rect.h
    if (lng < b.minLng || lng > b.maxLng || lat < b.minLat || lat > b.maxLat) return null
    return [x, y]
  }
  const projection = makeProjection(screen.kind, screen.center, screen.zoom, rect)
  const p = projection([lng, lat])
  if (!p) return null
  return [p[0], p[1]]
}

export function buildPts2d(
  cache: SegmentCache,
  key: string,
  screen: ScreenDef,
  rect: Rect,
  mode: MapMode,
  tr: Trajectory,
): Pts2d {
  let v = cache.get(key)
  if (!v) {
    v = tr.pts.map((p) => projectPoint(screen, rect, mode, p[0], p[1]))
    cache.set(key, v)
    if (cache.size > 8000) cache.clear()
  }
  return v
}

function relevant(screen: ScreenDef, tr: Trajectory) {
  if (screen.kind === 'us' || screen.kind === 'ussr') {
    if (!screen.bbox) return true
    return (
      regionContains(screen.bbox, tr.from) || regionContains(screen.bbox, tr.to)
    )
  }
  if (screen.kind === 'polar') {
    const la = Math.max(tr.from[1], tr.to[1])
    return la > 48
  }
  return true
}

export function drawMissileLayer(
  ctx: CanvasRenderingContext2D,
  screens: ScreenDef[],
  rects: Rect[],
  mode: MapMode,
  palette: Palette,
  trajs: Trajectory[],
  impacts: Impact[],
  cache: SegmentCache,
  time: number,
) {
  const W = ctx.canvas.width
  const H = ctx.canvas.height
  // phosphor fade (toward transparent, revealing the base layer)
  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  ctx.fillStyle = 'rgba(0,0,0,0.16)'
  ctx.fillRect(0, 0, W, H)
  ctx.restore()

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  screens.forEach((screen, si) => {
    if (screen.kind === 'radar' || screen.kind === 'forces' || screen.kind === 'detection')
      return
    const rect = rects[si]
    ctx.save()
    roundedClip(ctx, rect)
    for (const tr of trajs) {
      if (tr.state !== 'flight' && tr.state !== 'launch') continue
      if (!relevant(screen, tr)) continue
      const pts = buildPts2d(
        cache,
        si + ':' + tr.id,
        screen,
        rect,
        mode,
        tr,
      )
      const n = pts.length
      const headIdx = Math.min(n - 1, Math.max(0, Math.floor(tr.t * (n - 1))))
      const head = pts[headIdx]
      if (!head) continue
      const col = tr.side === 'ussr' ? palette.missileHostile : palette.missileFriendly
      // comet tail: walk backward collecting valid points
      const tail = 8 + Math.floor(tr.width * 2)
      let start = Math.max(0, headIdx - tail)
      const path = new Path2D()
      let started = false
      for (let i = headIdx; i >= start; i--) {
        const p = pts[i]
        if (!p) continue
        if (!started) {
          path.moveTo(p[0], p[1])
          started = true
        } else {
          path.lineTo(p[0], p[1])
        }
      }
      if (started) {
        ctx.strokeStyle = col
        ctx.globalAlpha = 0.55
        ctx.lineWidth = tr.width
        ctx.stroke(path)
      }
      // head glow
      ctx.globalAlpha = 1
      ctx.fillStyle = col
      const hr = 1.4 + tr.width * 0.7
      ctx.beginPath()
      ctx.arc(head[0], head[1], hr, 0, Math.PI * 2)
      ctx.fill()
      // launch flash
      if (tr.launchFlash > 0) {
        const lf = tr.launchFlash
        ctx.globalAlpha = lf
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(head[0], head[1], 2 + lf * 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }
    // impacts
    const b = screen.bbox
    for (const im of impacts) {
      if (b && !regionContains(b, im.pos)) continue
      const p = projectPoint(screen, rect, mode, im.pos[0], im.pos[1])
      if (!p) continue
      const prog = im.age / im.life
      const r = (im.big ? 3 : 1.6) + prog * (im.big ? 22 : 12)
      ctx.globalAlpha = (1 - prog) * 0.9
      ctx.strokeStyle = palette.impact
      ctx.lineWidth = im.big ? 2 : 1
      ctx.beginPath()
      ctx.arc(p[0], p[1], r, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 1
    }
    ctx.restore()
  })
  ctx.restore()
  void time
}
