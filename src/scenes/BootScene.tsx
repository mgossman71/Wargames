import { useEffect, useRef, useState } from 'react'
import { BOOT_LINES, type BootLine } from '../data/bootLines'
import { useApp } from '../state/store'

interface Row extends BootLine {
  id: number
}

export function BootScene() {
  const go = useApp((s) => s.go)
  const [rows, setRows] = useState<Row[]>([])
  const [done, setDone] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    let i = 0
    let cancelled = false
    let timer = 0
    const step = () => {
      if (cancelled) return
      if (i >= BOOT_LINES.length) {
        setDone(true)
        return
      }
      const line = BOOT_LINES[i]
      setRows((prev) => [...prev, { ...line, id: i }])
      i++
      timer = window.setTimeout(step, line.delay)
    }
    timer = window.setTimeout(step, 260)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!done) return
    const onKey = () => go('terminal')
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [done, go])

  const progress = Math.min(100, Math.round((rows.length / BOOT_LINES.length) * 100))

  return (
    <div className="scene boot">
      <div className="boot__box">
        <div className="boot__head">
          <span>WOPR // HARDWARE SELF-TEST</span>
          <span>1983 // CLASSIFIED SIMULATION</span>
        </div>
        <div className="boot__log" aria-live="polite">
          {rows.map((r) => (
            <div key={r.id} className={`boot__line boot__line--${r.kind}`}>
              {r.text || '\u00a0'}
            </div>
          ))}
          {done && (
            <div className="boot__line boot__line--ok blink" style={{ animation: 'blink 1s steps(1) infinite, bootline 220ms steps(1) forwards' }}>
              READY_
            </div>
          )}
        </div>
        <div className="boot__bar">
          <span style={{ width: `${done ? 100 : progress}%` }} />
        </div>
        <div className="boot__foot">
          <span className="muted">NATIONAL ORBITAL SPACE COMMAND // NORAD</span>
          {done ? (
            <button className="btn btn--solid" onClick={() => go('terminal')}>
              PRESS TO ENTER TERMINAL ▶
            </button>
          ) : (
            <span className="boot__prompt blink">INITIALIZING…</span>
          )}
        </div>
      </div>
    </div>
  )
}
