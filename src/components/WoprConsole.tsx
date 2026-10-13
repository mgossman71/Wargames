import { useEffect, useRef, useState } from 'react'
import { useApp } from '../state/store'
import { useWopr, type WoprLine } from '../state/wopr'
import { handleCommand, selectByRef } from '../state/commands'

/**
 * The persistent WOPR console — the film's interface: one conversation,
 * present in every scene. Full-screen in the terminal; a bottom overlay
 * everywhere else. No button bars; the human types (or clicks a menu row).
 */
export function WoprConsole() {
  const mode = useApp((s) => s.mode)
  const defcon = useApp((s) => s.defcon)
  const lines = useWopr((s) => s.lines)
  const [input, setInput] = useState('')
  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const variant = mode === 'terminal' ? 'full' : 'overlay'

  // Keep the newest line in view as WOPR types.
  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines, variant])

  // Hands on the keyboard: keep focus in the input as scenes change.
  useEffect(() => {
    inputRef.current?.focus()
  }, [mode, variant])

  // Anywhere you click, focus returns to the conversation.
  useEffect(() => {
    const onDown = () => window.setTimeout(() => inputRef.current?.focus(), 0)
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [])

  if (mode === 'boot') return null

  function submit() {
    const v = input
    setInput('')
    if (v.trim()) handleCommand(v)
    inputRef.current?.focus()
  }

  return (
    <div className={`wopr-console wopr-console--${variant}`}>
      {variant === 'full' && (
        <div className="wopr-console__top">
          <span className="lamp lamp--green lamp--on" />
          <span className="wopr-console__title">JOSHUA</span>
          <span className="wopr-console__sub">STRATEGIC GAME ASSISTANT // TERMINAL</span>
          <span className="wopr-console__spacer" />
          <span className="wopr-console__defcon">DEFCON {defcon}</span>
          <span className={`lamp ${defcon <= 3 ? 'lamp--red lamp--on' : 'lamp--green lamp--on'}`} />
        </div>
      )}

      <div className="wopr-console__log" ref={logRef} aria-live="polite">
        {lines.map((l) => (
          <ConsoleLine key={l.id} line={l} />
        ))}
        <span className="wopr-cursor" aria-hidden="true" />
      </div>

      <div className="wopr-console__inputrow">
        <span className="wopr-console__prompt">JOSHUA&gt;</span>
        <input
          ref={inputRef}
          className="wopr-console__input"
          value={input}
          placeholder="type a command… (try: HELP)"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
        />
        {variant === 'overlay' && <span className="wopr-console__hint">ESC RETURNS</span>}
      </div>
    </div>
  )
}

function ConsoleLine({ line }: { line: WoprLine }) {
  // Menu rows (the games list) are typed out like everything else —
  // and, unlike the film, may also be clicked to select.
  if (line.kind === 'menu' && line.ref) {
    return (
      <div
        className="wopr-line wopr-line--menu"
        role="button"
        tabIndex={0}
        onClick={() => selectByRef(line.ref!)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            selectByRef(line.ref!)
          }
        }}
      >
        {line.text || '\u00a0'}
      </div>
    )
  }
  const text = line.kind === 'user' ? `> ${line.text}` : line.text
  return (
    <div className={`wopr-line wopr-line--${line.kind}`}>
      {text || '\u00a0'}
    </div>
  )
}