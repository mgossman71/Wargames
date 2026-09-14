import { useApp } from '../state/store'
import { useBoardHud } from '../components/useBoardHud'
import { boardAvailable } from '../maps/boardSingleton'
import { StageControls } from './StageControls'

export function FinalScene() {
  const st = useApp()
  const hud = useBoardHud()
  const phase = hud?.phase ?? 'idle'
  const showRational = phase === 'rational' || phase === 'aftermath'
  const showTitle = phase === 'aftermath'

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
          <div className="wars__actions">
            <button className="btn btn--primary" onClick={() => boardAvailable()?.reset()}>
              RESET // STAND-BY
            </button>
            <button className="btn" onClick={() => st.go('norad')}>
              VIEW NORAD WALL
            </button>
          </div>
        </div>
      )}

      <div className="stage__bottom">
        <StageControls />
        <div className="stage__spacer" />
        <button className="btn" onClick={() => boardAvailable()?.reset()}>
          SURRENDER // RESET
        </button>
      </div>
    </div>
  )
}
