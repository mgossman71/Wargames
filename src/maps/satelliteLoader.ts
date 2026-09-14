import type { SatelliteSource } from './boardGeo'

let cache: SatelliteSource | null = null
let pending: Promise<SatelliteSource> | null = null

const URLS = [
  '/assets/maps/blue_marble_next_gen_3600.jpg',
  '/assets/maps/blue_marble_truecolor_2048.jpg',
  'assets/maps/blue_marble_next_gen_3600.jpg',
]

function tryLoad(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('fail ' + url))
    img.src = url
  })
}

/** Load the NASA Blue Marble equirectangular image (cached). */
export function loadBlueMarble(): Promise<SatelliteSource> {
  if (cache) return Promise.resolve(cache)
  if (pending) return pending
  pending = (async () => {
    let lastErr: unknown = null
    for (const u of URLS) {
      try {
        const img = await tryLoad(u)
        if (img.naturalWidth > 500 && img.naturalHeight > 200) {
          cache = { img }
          return cache
        }
      } catch (e) {
        lastErr = e
      }
    }
    throw lastErr ?? new Error('blue marble unavailable')
  })()
  return pending
}

export function blueMarbleReady() {
  return !!cache
}
