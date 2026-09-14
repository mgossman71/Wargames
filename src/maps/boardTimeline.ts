export type SimPhase =
  | 'idle'
  | 'alert'
  | 'strike'
  | 'retaliation'
  | 'exchange'
  | 'rational'
  | 'aftermath'

export interface Sim {
  phase: SimPhase
  t: number
  done: boolean
  fired: Record<string, boolean>
}

export const DUR: Record<SimPhase, number> = {
  idle: Infinity,
  alert: 6,
  strike: 8,
  retaliation: 10,
  exchange: 16,
  rational: 8,
  aftermath: 16,
}

const NEXT: Record<SimPhase, SimPhase> = {
  idle: 'idle',
  alert: 'strike',
  strike: 'retaliation',
  retaliation: 'exchange',
  exchange: 'rational',
  rational: 'aftermath',
  aftermath: 'idle',
}

export function simInit(): Sim {
  return { phase: 'idle', t: 0, done: false, fired: {} }
}

export interface PhaseInfo {
  defcon: number
  pace: number
  status: string
  usRead: number
  suRead: number
  label: string
}

export function phaseInfo(sim: Sim): PhaseInfo {
  const P = sim.phase
  const p = Math.min(1, sim.t / DUR[P])
  switch (P) {
    case 'alert':
      return { defcon: 4, pace: 0.3, status: 'UNIDENTIFIED CONTACTS', usRead: 96, suRead: 95, label: 'UNIDENTIFIED CONTACTS' }
    case 'strike':
      return { defcon: 3, pace: 0.55, status: `US FIRST STRIKE // ${Math.round(p * 100)}% TRACKED`, usRead: 90 - p * 6, suRead: 88 - p * 6, label: 'US FIRST STRIKE' }
    case 'retaliation':
      return { defcon: 3, pace: 0.8, status: `SOVIET RETALIATION // ${Math.round(p * 100)}% TRACKED`, usRead: 78 - p * 12, suRead: 80 - p * 12, label: 'SOVIET RETALIATION' }
    case 'exchange':
      return { defcon: 2, pace: 1.0, status: 'MUTUAL STRIKE // ESCALATION CRITICAL', usRead: 52 - p * 18, suRead: 54 - p * 18, label: 'MUTUAL STRIKE' }
    case 'rational':
      return { defcon: 1, pace: 0.5, status: 'WOPR: THE ONLY RATIONAL CHOICE IS NOT TO PLAY', usRead: 30 + p * 4, suRead: 32 + p * 4, label: 'THE RATIONAL CHOICE' }
    case 'aftermath':
      return { defcon: 5, pace: 0.3, status: 'MUTUAL DISARMAMENT // THERE IS NO WINNING MOVE', usRead: 97, suRead: 96, label: 'MUTUAL DISARMAMENT' }
    case 'idle':
    default:
      return { defcon: 5, pace: 0.2, status: 'STANDBY // NO HOSTILE ACTIVITY', usRead: 97, suRead: 96, label: 'STANDBY' }
  }
}

/**
 * Advance the final-simulation timeline. `spawn` is provided by the caller
 * (BigBoard) and is responsible for honoring the quality cap.
 */
export function simTick(
  sim: Sim,
  dt: number,
  spawn: (scenarioName: string, n: number) => void,
) {
  if (sim.done || sim.phase === 'idle') return
  sim.t += dt
  const fire = (k: string, f: () => void) => {
    if (!sim.fired[k]) {
      sim.fired[k] = true
      f()
    }
  }
  switch (sim.phase) {
    case 'alert':
      fire('alert', () => spawn('MEDITERRANEAN WAR', 24))
      break
    case 'strike':
      fire('strike', () => spawn('U.S. FIRST STRIKE', 90))
      break
    case 'retaliation':
      fire('retal', () => spawn('USSR FIRST STRIKE', 120))
      break
    case 'exchange':
      fire('exchange', () => spawn('U.S. / USSR ESCALATION', 160))
      if (sim.t > 2) {
        const n = Math.floor(dt * (sim.t < 7 ? 42 : 14))
        if (n > 0) spawn('U.S. / USSR ESCALATION', n)
      }
      break
    default:
      break
  }
  if (sim.t >= DUR[sim.phase]) {
    sim.t = 0
    sim.phase = NEXT[sim.phase]
    if (sim.phase === 'idle') sim.done = true
  }
}
