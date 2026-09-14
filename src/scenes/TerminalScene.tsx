import { useEffect, useRef, useState } from 'react'
import { useApp } from '../state/store'
import { boardAvailable } from '../maps/boardSingleton'
import { resolvePreset, autoDetect } from '../state/quality'
import { MODE_LABEL } from '../maps/mapStyles'

type Kind = 'sys' | 'ok' | 'warn' | 'err' | 'title' | 'dim' | 'user'
interface Line {
  id: number
  text: string
  kind: Kind
}

let lid = 0
const L = (text: string, kind: Kind = 'sys'): Line => ({ id: lid++, text, kind })

const GREETING: Line[] = [
  L('JOSHUA // STRATEGIC GAME ASSISTANT', 'title'),
  L('Secure link established. I am online and ready to assist.', 'sys'),
  L('I have been training on game strategies for a number of years.', 'dim'),
  L('I can show you a war plan, the display wall, or we can play a game.', 'dim'),
  L('Type HELP for a list of commands.', 'warn'),
]

const QUICK = ['HELP', 'STATUS', 'NORAD', 'WOPR', 'GTW', 'FINAL', 'TICTACTOE', 'MAP', 'SURRENDER']

export function TerminalScene() {
  const st = useApp()
  const [lines, setLines] = useState<Line[]>(() => GREETING.map((l) => ({ ...l })))
  const [input, setInput] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function run(raw: string) {
    const cmd = raw.trim().toLowerCase()
    const out: Line[] = [L(`JOSHUA> ${raw.trim()}`, 'user')]
    const board = boardAvailable()

    if (!cmd) {
      setLines((p) => [...p, ...out])
      return
    }
    if (cmd === 'help' || cmd === '?' || cmd === 'h') {
      out.push(
        L('AVAILABLE COMMANDS', 'title'),
        L('  STATUS     — system / DEFCON / quality readout', 'dim'),
        L('  NORAD      — open the NORAD display wall', 'dim'),
        L('  WOPR       — view the WOPR machine', 'dim'),
        L('  GTW        — interactive Global Thermonuclear War plan', 'dim'),
        L('  FINAL      — run the automatic final simulation', 'dim'),
        L('  TICTACTOE  — play a game (a very easy one)', 'dim'),
        L('  MAP        — cycle the tactical display style', 'dim'),
        L('  CRT / SOUND / QUALITY — adjust the simulation', 'dim'),
        L('  SURRENDER  — abort the exchange and reset', 'dim'),
      )
    } else if (cmd === 'status' || cmd === 'stat') {
      out.push(
        L('SYSTEM STATUS', 'title'),
        L(`  PERSONALITY ....... JOSHUA (ONLINE)`, 'ok'),
        L(`  DEFCON ............ ${st.defcon} / 5`, st.defcon <= 3 ? 'warn' : 'sys'),
        L(`  CORE TEMP ......... ${st.wopr.coreTemp.toFixed(1)} C`, 'sys'),
        L(`  COMPUTE LOAD ...... ${st.wopr.load.toFixed(0)} %`, 'sys'),
        L(`  GAMES TRAINED ..... ${st.wopr.gamesTrained}`, 'sys'),
        L(`  DISPLAY MODE ...... ${MODE_LABEL[st.mapMode]}`, 'sys'),
        L(`  QUALITY ........... ${resolvePreset(st.quality).label} (AUTO: ${autoDetect()})`, 'sys'),
        L(`  CRT / SOUND ....... ${st.crt.toUpperCase()} / ${st.sound ? 'ON' : 'OFF'}`, 'sys'),
      )
    } else if (cmd === 'norad' || cmd === 'n') {
      out.push(L('Opening the NORAD display wall…', 'ok'))
      setLines((p) => [...p, ...out]); st.go('norad'); return
    } else if (cmd === 'wopr' || cmd === 'machine') {
      out.push(L('Routing to the WOPR cabinet…', 'ok'))
      setLines((p) => [...p, ...out]); st.go('wopr'); return
    } else if (cmd === 'gtw' || cmd === 'thermonuclear' || cmd === 'war') {
      out.push(L('Loading the Global Thermonuclear War planner…', 'ok'))
      setLines((p) => [...p, ...out]); st.go('gtw'); return
    } else if (cmd === 'final' || cmd === 'play' || cmd === 'start' || cmd === 'simulation') {
      if (!board) out.push(L('ERROR: display wall not ready.', 'err'))
      else {
        board.startFinalSimulation()
        out.push(L('Initiating the final simulation. This game has no winning move.', 'warn'))
        setLines((p) => [...p, ...out]); st.go('final'); return
      }
    } else if (cmd === 'map') {
      st.cycleMapMode()
      out.push(L(`Display style: ${MODE_LABEL[st.mapMode]}`, 'ok'))
    } else if (cmd === 'tictactoe' || cmd === 'tictac' || cmd === 'game' || cmd === 'tic') {
      out.push(L('Starting a game of Tic-Tac-Toe. I always play second.', 'ok'))
      setLines((p) => [...p, ...out]); st.go('tictactoe'); return
    } else if (cmd === 'crt') {
      st.cycleCrt()
      out.push(L(`CRT effect: ${useApp.getState().crt.toUpperCase()}`, 'ok'))
    } else if (cmd === 'sound') {
      st.toggleSound()
      out.push(L(`Sound: ${useApp.getState().sound ? 'ON' : 'OFF'}`, 'ok'))
    } else if (cmd === 'quality') {
      st.cycleQuality()
      out.push(L(`Quality: ${useApp.getState().quality.toUpperCase()}`, 'ok'))
    } else if (cmd === 'surrender' || cmd === 'abort') {
      board?.reset(); st.setSimPhase('idle'); st.setDefcon(5)
      out.push(L('Exchange aborted. Returning to standby.', 'ok'))
    } else if (cmd === 'reset' || cmd === 'clear') {
      board?.reset(); st.setSimPhase('idle'); st.setDefcon(5)
      setLines([L('JOSHUA // STRATEGIC GAME ASSISTANT', 'title'), L('System reset. Type HELP for commands.', 'sys')])
      return
    } else if (cmd === 'hello' || cmd === 'hi') {
      out.push(L('Greetings. How may I be of assistance?', 'sys'))
    } else {
      out.push(L(`"${cmd}" is not a recognized command.`, 'err'), L('Did you mean: HELP, STATUS, NORAD, WOPR, GTW, FINAL, TICTACTOE?', 'dim'))
    }

    setLines((p) => [...p, ...out])
  }

  return (
    <div className="scene terminal" onClick={() => inputRef.current?.focus()}>
      <div className="terminal__top">
        <span className="lamp lamp--green lamp--on" />
        <span className="terminal__title">JOSHUA</span>
        <span className="terminal__sub">STRATEGIC GAME ASSISTANT // TERMINAL</span>
        <div className="terminal__lamps">
          <span className="muted" style={{ fontSize: 11, letterSpacing: '0.18em' }}>DEFCON {st.defcon}</span>
          <span className={`lamp ${st.defcon <= 3 ? 'lamp--red' : 'lamp--green'} ${st.defcon <= 3 ? 'lamp--on' : ''}`} />
          <span className="lamp lamp--amber lamp--on" />
          <span className="lamp lamp--green lamp--on" />
        </div>
      </div>

      <div className="terminal__body" ref={bodyRef}>
        {lines.map((l) => (
          <div key={l.id} className={`tl tl--${l.kind}`}>
            {l.text || '\u00a0'}
          </div>
        ))}
      </div>

      <div className="terminal__inputrow">
        <span className="terminal__prompt">JOSHUA&gt;</span>
        <input
          ref={inputRef}
          className="terminal__input"
          value={input}
          placeholder="type a command… (try: HELP)"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              run(input)
              setInput('')
            }
          }}
        />
      </div>

      <div className="terminal__quick">
        {QUICK.map((q) => (
          <button key={q} className="btn" onClick={() => { run(q); setInput('') }}>
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}

