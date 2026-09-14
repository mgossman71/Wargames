import { useApp } from '../state/store'
import { MAP_MODES, MODE_LABEL } from '../maps/mapStyles'
import { QUALITY_LEVELS } from '../state/quality'

export function StageControls() {
  const st = useApp()
  return (
    <>
      <div className="stage__group">
        <span className="stage__label">STYLE</span>
        <div className="seg">
          {MAP_MODES.map((m) => (
            <button key={m} aria-pressed={st.mapMode === m} onClick={() => st.setMapMode(m)}>
              {MODE_LABEL[m]}
            </button>
          ))}
        </div>
      </div>
      <div className="stage__group">
        <span className="stage__label">QUALITY</span>
        <div className="seg">
          {QUALITY_LEVELS.map((q) => (
            <button key={q} aria-pressed={st.quality === q} onClick={() => st.setQuality(q)}>
              {q[0].toUpperCase()}
            </button>
          ))}
          <button aria-pressed={st.quality === 'auto'} onClick={() => st.setQuality('auto')}>
            AUTO
          </button>
        </div>
      </div>
      <div className="stage__group">
        <button className="btn" onClick={() => st.cycleCrt()}>
          CRT:{st.crt.toUpperCase()}
        </button>
        <button className="btn" onClick={() => st.toggleSound()}>
          SND:{st.sound ? 'ON' : 'OFF'}
        </button>
      </div>
    </>
  )
}
