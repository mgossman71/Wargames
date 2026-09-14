import { useEffect, useRef } from 'react'
import { useApp } from './state/store'
import { CrtOverlay } from './components/CrtOverlay'
import { getBoard, boardAvailable, BOARD_MODES } from './maps/boardSingleton'
import { BootScene } from './scenes/BootScene'
import { TerminalScene } from './scenes/TerminalScene'
import { WoprScene } from './scenes/WoprScene'
import { NoradScene } from './scenes/NoradScene'
import { GtwScene } from './scenes/GtwScene'
import { FinalScene } from './scenes/FinalScene'
import { TictactoeScene } from './scenes/TictactoeScene'

export default function App() {
  const mode = useApp((s) => s.mode)
  const mapMode = useApp((s) => s.mapMode)
  const quality = useApp((s) => s.quality)
  const rootRef = useRef<HTMLDivElement>(null)

  // Create the board once, mounted into the always-present root layer.
  useEffect(() => {
    if (rootRef.current) getBoard(rootRef.current)
    document.title = 'WOPR // 1983 — War Games'
  }, [])

  // Run the board only while it is the visible surface; otherwise pause it.
  useEffect(() => {
    const b = boardAvailable()
    if (!b) return
    if (BOARD_MODES.includes(mode)) b.resume()
    else b.pause()
  }, [mode])

  // Keep the board in sync with global settings.
  useEffect(() => { boardAvailable()?.setMapMode(mapMode) }, [mapMode])
  useEffect(() => { boardAvailable()?.setQualityLevel(quality) }, [quality])

  const scene =
    mode === 'boot' ? <BootScene />
      : mode === 'terminal' ? <TerminalScene />
        : mode === 'wopr' ? <WoprScene />
          : mode === 'norad' ? <NoradScene />
            : mode === 'gtw' ? <GtwScene />
              : mode === 'final' ? <FinalScene />
                : <TictactoeScene />

  return (
    <div className="app">
      <div ref={rootRef} className="board-root" />
      {scene}
      <CrtOverlay />
    </div>
  )
}
