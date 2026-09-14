import { BigBoard } from './BigBoard'
import type { BoardPhase } from './BigBoard'
import { useApp } from '../state/store'
import type { Mode, SimPhase } from '../state/store'

const PHASE_MAP: Record<BoardPhase, { sim: SimPhase; defcon: number }> = {
  idle: { sim: 'idle', defcon: 5 },
  alert: { sim: 'escalating', defcon: 4 },
  strike: { sim: 'escalating', defcon: 3 },
  retaliation: { sim: 'escalating', defcon: 3 },
  exchange: { sim: 'climax', defcon: 2 },
  rational: { sim: 'resolving', defcon: 1 },
  aftermath: { sim: 'done', defcon: 5 },
}

let board: BigBoard | null = null

export function getBoard(container: HTMLElement): BigBoard {
  if (!board) {
    board = new BigBoard(container, {
      onPhase: (phase) => {
        const m = PHASE_MAP[phase]
        if (!m) return
        const st = useApp.getState()
        st.set('simPhase', m.sim)
        st.setDefcon(m.defcon)
      },
    })
  }
  return board
}

export function boardAvailable() {
  return board
}

export const BOARD_MODES: Mode[] = ['norad', 'gtw', 'final']
export function isBoardMode(m: Mode) {
  return BOARD_MODES.includes(m)
}
