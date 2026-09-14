import type { Palette, ScreenDef } from './mapStyles'
import type { Rect, Hud } from './boardGeo'

export function drawScreenFrame(
  ctx: CanvasRenderingContext2D,
  screen: ScreenDef,
  rect: Rect,
  palette: Palette,
  time: number,
) {
  ctx.save()
  // bezel
  ctx.strokeStyle = 'rgba(90,120,140,0.35)'
  ctx.lineWidth = 1
  ctx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1)
  ctx.strokeStyle = 'rgba(9,18,26,0.9)'
  ctx.strokeRect(rect.x + 2.5, rect.y + 2.5, rect.w - 5, rect.h - 5)
  // corner ticks
  ctx.strokeStyle = palette.landStroke
  ctx.lineWidth = 1.5
  const c = 10
  const corners: Array<[number, number, number, number]> = [
    [rect.x + 3, rect.y + 3, 1, 1],
    [rect.x + rect.w - 3, rect.y + 3, -1, 1],
    [rect.x + rect.w - 3, rect.y + rect.h - 3, -1, -1],
    [rect.x + 3, rect.y + rect.h - 3, 1, -1],
  ]
  for (const [cx, cy, sx, sy] of corners) {
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + c * sx, cy)
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx, cy + c * sy)
    ctx.stroke()
  }
  // label
  const fontPx = Math.max(9, Math.min(12, rect.w * 0.055))
  ctx.font = `600 ${fontPx}px "IBM Plex Mono", ui-monospace, monospace`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'
  ctx.fillStyle = palette.text
  ctx.fillText(screen.label, rect.x + 8, rect.y + 7)
  ctx.font = `${Math.max(8, fontPx - 1)}px "IBM Plex Mono", monospace`
  ctx.fillStyle = palette.textDim
  ctx.textAlign = 'right'
  ctx.fillText(screen.sub ?? '', rect.x + rect.w - 8, rect.y + 7)
  // rec lamp
  const lampOn = Math.sin(time * 3 + rect.x) > -0.6
  ctx.fillStyle = lampOn ? palette.friendly : 'rgba(80,90,100,0.5)'
  ctx.beginPath()
  ctx.arc(rect.x + rect.w - 9, rect.y + rect.h - 10, 2.2, 0, Math.PI * 2)
  ctx.fill()
  // moving scanline
  const sy = rect.y + ((time * 26) % rect.h)
  const scan = ctx.createLinearGradient(0, sy - 8, 0, sy + 8)
  scan.addColorStop(0, 'transparent')
  scan.addColorStop(0.5, 'rgba(150,230,255,0.05)')
  scan.addColorStop(1, 'transparent')
  ctx.fillStyle = scan
  ctx.fillRect(rect.x, sy - 8, rect.w, 16)
  ctx.restore()
}

export function drawHeader(
  ctx: CanvasRenderingContext2D,
  W: number,
  palette: Palette,
  hud: Hud,
  time: number,
) {
  ctx.save()
  const h = 30
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, 'rgba(6,14,22,0.95)')
  g.addColorStop(1, 'rgba(6,14,22,0.7)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, h)
  ctx.strokeStyle = 'rgba(90,200,255,0.35)'
  ctx.beginPath()
  ctx.moveTo(0, h)
  ctx.lineTo(W, h)
  ctx.stroke()
  const fs = 12
  ctx.font = `600 ${fs}px "IBM Plex Mono", ui-monospace, monospace`
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.fillStyle = palette.text
  ctx.fillText('NATIONAL ORBITAL SPACE COMMAND // SILENT DEFCON SIMULATOR', 12, h / 2)
  // defcon
  ctx.textAlign = 'right'
  ctx.fillStyle = hud.defcon >= 3 ? palette.hostile : palette.textDim
  ctx.fillText('DEFCON ' + hud.defcon, W - 12, h / 2)
  // blinking status lamp
  const on = Math.sin(time * 6) > 0
  ctx.fillStyle = on ? palette.hostile : 'rgba(120,40,40,0.5)'
  ctx.beginPath()
  ctx.arc(W - 150, h / 2, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = palette.textDim
  ctx.textAlign = 'left'
  ctx.font = `${fs - 1}px "IBM Plex Mono", monospace`
  ctx.fillText(hud.status, W - 300, h / 2)
  void W
  ctx.restore()
}
