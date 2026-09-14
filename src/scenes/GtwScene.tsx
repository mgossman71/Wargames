import { useApp } from '../state/store'
import { useBoardHud } from '../components/useBoardHud'
import { boardAvailable } from '../maps/boardSingleton'
import { beep } from '../audio'
import { regionsForSide, type Region } from '../data/regions'
import { StageControls } from './StageControls'

export function GtwScene() {
  const st = useApp()
  const hud = useBoardHud()
  const side = st.gtwSide
  const targetSide = side === 'us' ? 'ussr' : 'us'
  const regions: Region[] = regionsForSide(targetSide)

  const selectAll = () => st.set('gtwRegions', regions.map((r) => r.id))

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

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn" onClick={selectAll}>
            TARGET ALL {side === 'us' ? 'SOVIET' : 'U.S.'} SITES
          </button>
          <button className="btn" onClick={() => st.clearRegions()}>
            CLEAR
          </button>
          <button
            className="btn btn--primary"
            onClick={() => {
              beep(120, 0.2)
              boardAvailable()?.runExchange()
            }}
          >
            ▶ EXECUTE EXCHANGE
          </button>
        </div>
      </div>

      <div className="stage__bottom">
        <StageControls />
        <div className="stage__spacer" />
        <button className="btn" onClick={() => st.go('norad')}>
          ◀ STAND-BY
        </button>
      </div>
    </div>
  )
}
