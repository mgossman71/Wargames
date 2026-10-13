import { useEffect, useRef } from 'react'
import { useBoardHud } from '../components/useBoardHud'
import { speak } from '../state/wopr'
import { STRANGE_GAME } from '../data/woprLines'

/**
 * Final simulation — the board plays out behind. When it resolves, WOPR
 * delivers the verdict, typed into the console, exactly like the film's
 * closing line. No buttons: RESET / NORAD / ESC are typed.
 */
export function FinalScene() {
  const hud = useBoardHud()
  const phase = hud?.phase ?? 'idle'
  const showRational = phase === 'rational' || phase === 'aftermath'
  const showTitle = phase === 'aftermath'
  const announced = useRef(false)

  useEffect(() => {
    if (announced.current) return
    if (phase === 'rational' || phase === 'aftermath') {
      announced.current = true
      speak(STRANGE_GAME)
    }
    if (phase === 'idle') announced.current = false
  }, [phase])

  return (
    <div className="scene stage">
      <div className="stage__dim" />
      <div className="stage__topbar">
        <span className="stage__chip">
          <span className="lamp lamp--red lamp--on lamp--blink" /> FINAL SIMULATION
        </span>
        {hud && <span className="stage__chip">DEFCON <b>{hud.defcon}</b></span>}
      </div>

      {showRational && (
        <div className="wars">
          <div className="wars__rational" style={{ animation: 'msgflicker 5s linear infinite' }}>
            &ldquo;THIS GAME HAS NO WINNING MOVE.&rdquo;
          </div>
          {showTitle && (
            <>
              <div className="wars__title">WARS GAMES</div>
              <div className="wars__sub">A GAME WITH NO WINNING MOVE</div>
            </>
          )}
          <div className="wars__hint">TYPE RESET TO STAND DOWN · NORAD FOR THE WALL · ESC RETURNS</div>
        </div>
      )}
    </div>
  )
}