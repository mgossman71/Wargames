import { useApp } from '../state/store'

/** Fullscreen CRT effects overlay (scanlines, vignette, roll, flicker). */
export function CrtOverlay() {
  const crt = useApp((s) => s.crt)
  return (
    <div className="crt-overlay" data-crt={crt} aria-hidden="true">
      <div className="crt-scanlines" />
      <div className="crt-vignette" />
      <div className="crt-roll" />
      <div className="crt-flicker" />
      <div className="crt-vgate" />
    </div>
  )
}
