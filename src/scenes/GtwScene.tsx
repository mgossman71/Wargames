import { useApp } from '../state/store'
import { useBoardHud } from '../components/useBoardHud'
import { regionsForSide } from '../data/regions'

/**
 * GTW planner — the map is the surface behind; the side/region pickers are a
 * list you choose from (clickable, and also typeable: US, USSR, TARGET ALL,
 * CLEAR, LAUNCH). No bottom button bar — WOPR's console says "TYPE LAUNCH".
 */
export function GtwScene() {
  const st = useApp()
  const hud = useBoardHud()
  const side = st.gtwSide
  const targetSide = side === 'us' ? 'ussr' : 'us'
  const regions = regionsForSide(targetSide)

  return (
    <div className="scene stage">
      <div className="stage__dim" />
      <div className="stage__topbar">
        <span className="stage__chip">
          <span className="lamp lamp--red lamp--on" /> GLOBAL THERMONUCLEAR WAR — PLANNER
        </span>
        {hud && <span className="stage__chip">DEFCON <b>{hud.defcon}</b></span>}
        <span className="stage__chip">TARGETING <b>{st.gtwRegions.length}</b></span>
      </div>

      <div className="gtw-panel">
        <h3>ATTACKING SIDE</h3>
        <div className="gtw-side">
          <button className="btn" aria-pressed={side === 'us'} onClick={() => st.setGtwSide('us')}>
            UNITED STATES
          </button>
          <button className="btn" aria-pressed={side === 'ussr'} onClick={() => st.setGtwSide('ussr')}>
            SOVIET UNION
          </button>
        </div>

        <h3>TARGET REGIONS — {side === 'us' ? 'SOVIET FORCES' : 'U.S. FORCES'}</h3>
        <div className="region-list">
          {regions.map((r) => (
            <button
              key={r.id}
              className={`region${st.gtwRegions.includes(r.id) ? ' region--active' : ''}`}
              aria-pressed={st.gtwRegions.includes(r.id)}
              onClick={() => st.toggleRegion(r.id)}
            >
              <span>{r.label}</span>
              <span className="dot" />
            </button>
          ))}
        </div>

        <div className="gtw-panel__hint">TYPE &nbsp;LAUNCH&nbsp; TO FIRE · TARGET ALL · CLEAR · ESC RETURNS</div>
      </div>
    </div>
  )
}