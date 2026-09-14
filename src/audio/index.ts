import { useApp } from '../state/store'

let ctx: AudioContext | null = null

function audioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/**
 * Short synthesized blip. Respects the global sound / volume settings and
 * stays silent when sound is disabled or the API is unavailable.
 */
export function beep(freq = 440, dur = 0.12, type: OscillatorType = 'square', gain = 0.05): void {
  const { sound, volume } = useApp.getState()
  if (!sound || volume <= 0) return
  const ac = audioCtx()
  if (!ac) return
  try {
    const t = ac.currentTime
    const osc = ac.createOscillator()
    const g = ac.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain * volume), t + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.02, dur))
    osc.connect(g)
    g.connect(ac.destination)
    osc.start(t)
    osc.stop(t + Math.max(0.03, dur) + 0.02)
    osc.onended = () => {
      osc.disconnect()
      g.disconnect()
    }
  } catch {
    /* audio is best-effort */
  }
}

export function chirp(freqFrom = 880, freqTo = 220, dur = 0.5): void {
  const { sound, volume } = useApp.getState()
  if (!sound || volume <= 0) return
  const ac = audioCtx()
  if (!ac) return
  try {
    const t = ac.currentTime
    const osc = ac.createOscillator()
    const g = ac.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(freqFrom, t)
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqTo), t + dur)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.06 * volume), t + 0.05)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(g)
    g.connect(ac.destination)
    osc.start(t)
    osc.stop(t + dur + 0.03)
    osc.onended = () => {
      osc.disconnect()
      g.disconnect()
    }
  } catch {
    /* audio is best-effort */
  }
}