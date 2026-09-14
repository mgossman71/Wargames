import type { Palette, ScreenDef } from './mapStyles'
import type { Rect, Hud } from './boardGeo'
import { mulberry32, type RNG } from '../utils/rng'
import { clamp } from '../utils/math'

let rng: RNG = mulberry32(1337)

function inRect(px: number, py: number, r: Rect) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h
}

export function drawRadar(
  ctx: CanvasRenderingContext2D,
  screen: ScreenDef,
  rect: Rect,
  palette: Palette,
  hud: Hud,
  time: number,
) {
  ctx.save()
  const cx = rect.x + rect.w / 2
  const cy = rect.y + rect.h / 2
  const R = Math.min(rect.w, rect.h) * 0.42
  ctx.fillStyle = 'rgba(1,6,3,0.55)'
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, Math.PI * 2)
  ctx.fill()

  // rings
  ctx.strokeStyle = 'rgba(55,224,122,0.25)'
  ctx.lineWidth = 1
  for (let i = 1; i <= 4; i++) {
    ctx.beginPath()
    ctx.arc(cx, cy, (R / 4) * i, 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.moveTo(cx - R, cy)
  ctx.lineTo(cx + R, cy)
  ctx.moveTo(cx, cy - R)
  ctx.lineTo(cx, cy + R)
  ctx.stroke()

  // sweep
  const ang = (time * 0.9) % (Math.PI * 2)
  const hasConic =
    typeof (ctx as unknown as { createConicGradient?: unknown }).createConicGradient === 'function'
  const sweep = hasConic
    ? (ctx as unknown as { createConicGradient: (a: number, x: number, y: number) => unknown }).createConicGradient(ang, cx, cy)
    : null
  if (sweep) {
    ;(sweep as CanvasGradient).addColorStop(0, 'rgba(55,224,122,0.5)')
    ;(sweep as CanvasGradient).addColorStop(0.12, 'rgba(55,224,122,0.02)')
    ;(sweep as CanvasGradient).addColorStop(1, 'transparent')
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, R, 0, Math.PI * 2)
    ctx.fillStyle = sweep as unknown as CanvasGradient
    ctx.globalCompositeOperation = 'lighter'
    ctx.fill()
    ctx.restore()
  }

  // blips
  for (const d of hud.detections) {
    const bx = cx + (d.x - 0.5) * 2 * R * 0.9
    const by = cy + (d.y - 0.5) * 2 * R * 0.9
    const a = clamp(1 - d.age / 6, 0.1, 1)
    const col =
      d.side === 'ussr' ? palette.hostile : d.side === 'us' ? palette.friendly : palette.detection
    ctx.fillStyle = col
    ctx.globalAlpha = a
    ctx.beginPath()
    ctx.arc(bx, by, 2 + d.age * 0.3, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // rim
  ctx.strokeStyle = 'rgba(55,224,122,0.5)'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

export function drawForces(
  ctx: CanvasRenderingContext2D,
  screen: ScreenDef,
  rect: Rect,
  palette: Palette,
  hud: Hud,
  time: number,
) {
  ctx.save()
  const pad = Math.max(8, rect.w * 0.05)
  const x0 = rect.x + pad
  const innerW = rect.w - pad * 2
  const rows: Array<[string, number, string]> = [
    ['US ICBMs', hud.usReadiness, palette.friendly],
    ['US SLBMs', clamp(hud.usReadiness - 4 + Math.sin(time) * 2, 0, 100), palette.friendly],
    ['US Bombers', clamp(hud.usReadiness - 8, 0, 100), palette.friendly],
    ['US Interceptors', 78, palette.friendly],
    ['SU ICBMs', hud.suReadiness, palette.hostile],
    ['SU SLBMs', clamp(hud.suReadiness - 3, 0, 100), palette.hostile],
    ['SU Bombers', clamp(hud.suReadiness - 6, 0, 100), palette.hostile],
  ]
  const top = rect.y + pad * 1.6
  const rowH = (rect.h - pad * 2.4) / rows.length
  const fontPx = Math.max(9, rect.w * 0.052)
  ctx.font = `${fontPx}px "IBM Plex Mono", ui-monospace, monospace`
  ctx.textBaseline = 'middle'
  for (let i = 0; i < rows.length; i++) {
    const [label, val, col] = rows[i]
    const y = top + rowH * i + rowH * 0.5
    ctx.fillStyle = palette.textDim
    ctx.textAlign = 'left'
    ctx.fillText(label, x0, y)
    // bar track
    const barX = x0 + innerW * 0.4
    const barW = innerW * 0.5
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.fillRect(barX, y - 3, barW, 6)
    ctx.fillStyle = col
    ctx.globalAlpha = 0.85
    ctx.fillRect(barX, y - 3, barW * (val / 100), 6)
    ctx.globalAlpha = 1
    ctx.fillStyle = palette.text
    ctx.textAlign = 'right'
    ctx.fillText(`${Math.round(val)}%`, x0 + innerW, y)
  }
  ctx.restore()
}

export function drawDetection(
  ctx: CanvasRenderingContext2D,
  screen: ScreenDef,
  rect: Rect,
  palette: Palette,
  hud: Hud,
  time: number,
) {
  ctx.save()
  const pad = Math.max(8, rect.w * 0.05)
  const fontPx = Math.max(9, rect.w * 0.05)
  ctx.font = `${fontPx}px "IBM Plex Mono", ui-monospace, monospace`
  ctx.textBaseline = 'top'
  const lineH = fontPx * 1.5
  const maxLines = Math.floor((rect.h - pad * 2) / lineH)
  const lines = hud.feed.slice(-maxLines)
  let y = rect.y + pad
  ctx.textAlign = 'left'
  for (const ln of lines) {
    const hostile = /HOSTILE|SU[-\s]/i.test(ln)
    const friendly = /FRIENDLY|US[-\s]/i.test(ln)
    ctx.fillStyle = hostile ? palette.hostile : friendly ? palette.friendly : palette.textDim
    ctx.fillText(ln.slice(0, Math.floor(rect.w / fontPx / 0.62)), rect.x + pad, y)
    y += lineH
  }
  // header count
  ctx.fillStyle = palette.text
  ctx.textAlign = 'right'
  ctx.fillText(`OBJ ${hud.totalActive}`, rect.x + rect.w - pad, rect.y + pad - 1)
  void time
  ctx.restore()
}

export { inRect }
