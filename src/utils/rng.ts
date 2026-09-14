/* Small, fast, deterministic PRNG (mulberry32) + helpers. */
export type RNG = () => number

export function mulberry32(seed: number): RNG {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randRange(rng: RNG, min: number, max: number): number {
  return min + (max - min) * rng()
}

export function randInt(rng: RNG, min: number, max: number): number {
  return Math.floor(randRange(rng, min, max + 1))
}

export function pick<T>(rng: RNG, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

export function randChoiceWeights<T>(rng: RNG, items: readonly T[], weights: readonly number[]): T {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = rng() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}

/** Non-deterministic convenience (uses Math.random). */
export const chance = (p: number) => Math.random() < p
export const between = (a: number, b: number) => a + Math.random() * (b - a)
export const betweenInt = (a: number, b: number) => Math.floor(between(a, b + 1))
