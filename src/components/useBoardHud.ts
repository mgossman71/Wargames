import { useEffect, useState } from 'react'
import { boardAvailable } from '../maps/boardSingleton'
import type { Hud } from '../maps/boardGeo'

/** Poll the live board HUD at ~5Hz for DOM overlays. */
export function useBoardHud(enabled = true): Hud | null {
  const [hud, setHud] = useState<Hud | null>(null)
  useEffect(() => {
    if (!enabled) return
    const read = () => {
      const b = boardAvailable()
      if (b) setHud(b.getHud())
    }
    read()
    const id = window.setInterval(read, 200)
    return () => window.clearInterval(id)
  }, [enabled])
  return hud
}
