import { useBoardHud } from '../components/useBoardHud'

/**
 * NORAD display wall — the board (world map + live traffic) is the surface
 * behind this scene. No button bar: WOPR's console carries the commands
 * (FINAL, HELP, ESC…) and says so when the wall opens.
 */
export function NoradScene() {
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
    </div>
  )
}