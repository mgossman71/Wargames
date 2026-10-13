import { useEffect, useState } from 'react'
import { useApp } from '../state/store'

function Readout({ label, value, unit, color }: { label: string; value: string; unit?: string; color?: string }) {
  return (
    <div className="readout bezel wopr__readout">
      <span className={`readout__value${color ? '' : ''}`} style={color ? { color, textShadow: `0 0 8px ${color}` } : undefined}>
        {value}
        {unit && <small> {unit}</small>}
      </span>
      <span className="bezel__label">{label}</span>
    </div>
  )
}

export function WoprScene() {
  const st = useApp()
  const w = st.wopr
  const [msg, setMsg] = useState('WORLD OPS // READY')

  useEffect(() => {
    setMsg(w.load > 60 ? 'HIGH COMPUTE LOAD // PROCESSING' : 'ALL SYSTEMS NOMINAL')
  }, [w.load])

  const defconColor = w.defcon <= 3 ? 'var(--hostile-red-bright)' : 'var(--ok-green)'

  return (
    <div className="scene wopr">
      <div className="wopr__stage">
        <div className="wopr-cabinet">
          <div className="wopr__topbar">
            <span className="wopr__brand">WOPR</span>
            <div className="wopr__lights">
              <span className="lamp lamp--green lamp--on" />
              <span className="lamp lamp--amber lamp--on" />
              <span className="lamp lamp--cyan lamp--on" />
              <span className="lamp lamp--red lamp--on" />
            </div>
          </div>

          <div className="crt-glass wopr-screen">
            <div className="wopr-screen__name">JOSHUA</div>
            <div className="wopr-screen__sub">STRATEGIC GAME ASSISTANT</div>
            <div className="wopr-screen__msg blink" style={{ animation: 'msgflicker 4s linear infinite' }}>
              {msg}
            </div>
            <div className="wopr-screen__sub">DO YOU WANT TO PLAY A GAME?</div>
          </div>

          <div className="wopr__readouts">
            <Readout label="CORE TEMP" value={w.coreTemp.toFixed(1)} unit="C" color="#7fe8b0" />
            <Readout label="COMPUTE LOAD" value={w.load.toFixed(0)} unit="%" color="#9be8ff" />
            <Readout label="DEFCON" value={String(w.defcon)} color={defconColor} />
            <Readout label="GAMES" value={w.gamesTrained.toLocaleString()} color="#ffcf8a" />
            <Readout label="HOURS RUN" value={w.hours.toFixed(1)} color="#c9c9c9" />
            <Readout label="LINK" value="SECURE" color="#7fe8b0" />
            <Readout label="MODE" value={st.simPhase.toUpperCase()} />
            <Readout label="PERSONALITY" value="JOSHUA" color="#9be8ff" />
          </div>

          <div className="wopr__vents" />
        </div>
        {/* No control buttons: the persistent WOPR console handles
            NORAD / STATUS / ESC — the film has no GUI, only the terminal. */}
      </div>

      <style>{`@keyframes msgflicker {0%,100%{opacity:1}48%{opacity:1}50%{opacity:.35}52%{opacity:1}74%{opacity:1}76%{opacity:.6}78%{opacity:1}}`}</style>
    </div>
  )
}
