import { useApp } from '../state/store'
import { useBoardHud } from '../components/useBoardHud'
import { boardAvailable } from '../maps/boardSingleton'
import { beep } from '../audio'
import { StageControls } from './StageControls'

export function NoradScene() {
  const st = useApp()
  const hud = useBoardHud()

  return (
    <div className="scene stage">
      <div className="stage__dim" />
      <div className="stage__topbar">
        <span className="stage__chip">
          <span className="lamp lamp--green lamp--on" /> NORAD DISPLAY WALL
        </span>
        {hud && (
          <>
            <span className="stage__chip">DEFCON <b>{hud.defcon}</b></span>
            <span className="stage__chip">TRACKS <b>{hud.totalActive}</b></span>
            <span className="stage__chip">INTERCEPTED <b>{hud.intercepted}</b></span>
            <span className="stage__chip">PHASE <b>{hud.phase.toUpperCase()}</b></span>
          </>
        )}
      </div>

      <div className="stage__bottom">
        <StageControls />
        <div className="stage__spacer" />
        <button
          className="btn btn--primary"
          onClick={() => {
            beep(150, 0.18)
            boardAvailable()?.startFinalSimulation()
            st.go('final')
          }}
        >
          ▶ INITIATE FINAL SIMULATION
        </button>
      </div>
    </div>
  )
}
