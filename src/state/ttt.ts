// =============================================================================
// Tic-tac-toe — shared state so the board scene and WOPR (typed commands)
// both play and announce moves through the one conversation.
// =============================================================================
import { create } from 'zustand'
import { speak, type SpeakItem } from './wopr'

export type TttCell = 'X' | 'O' | null
export type TttBoard = TttCell[]

const LINES: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

export function tttWinner(b: TttBoard): { w: TttCell; line: number[] } | null {
  for (const l of LINES) {
    const [a, c, d] = l
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { w: b[a], line: l }
  }
  return null
}

function bestScore(b: TttBoard, isX: boolean): number {
  const win = tttWinner(b)
  if (win) return win.w === 'X' ? 10 : -10
  if (b.every(Boolean)) return 0
  let best = isX ? -Infinity : Infinity
  b.forEach((v, i) => {
    if (v) return
    const nb = b.slice()
    nb[i] = isX ? 'X' : 'O'
    const s = bestScore(nb, !isX)
    if (isX ? s > best : s < best) best = s
  })
  return best
}

function bestMove(b: TttBoard, isX: boolean): number {
  const win = tttWinner(b)
  if (win) return -1
  const empty: number[] = []
  b.forEach((v, i) => { if (!v) empty.push(i) })
  if (empty.length === 0) return -1
  let bestScoreVal = isX ? -Infinity : Infinity
  let bm = empty[0]
  for (const i of empty) {
    const nb = b.slice()
    nb[i] = isX ? 'X' : 'O'
    const s = bestScore(nb, !isX)
    if (isX ? s > bestScoreVal : s < bestScoreVal) { bestScoreVal = s; bm = i }
  }
  return bm
}

const CELL_NAMES = [
  'ROW 1, COLUMN 1', 'ROW 1, COLUMN 2', 'ROW 1, COLUMN 3',
  'ROW 2, COLUMN 1', 'ROW 2, COLUMN 2', 'ROW 2, COLUMN 3',
  'ROW 3, COLUMN 1', 'ROW 3, COLUMN 2', 'ROW 3, COLUMN 3',
]

const EMPTY: TttBoard = Array(9).fill(null)

interface TttState {
  board: TttBoard
  /** Human plays X at cell i (0-8); JOSHUA (O) answers. Announcements go to WOPR. */
  move: (i: number) => void
  reset: () => void
}

export const useTtt = create<TttState>((set, get) => ({
  board: EMPTY,

  move: (i) => {
    const b = get().board
    if (i < 0 || i > 8 || b[i] || tttWinner(b)) return
    const nb = b.slice()
    nb[i] = 'X'
    const out: SpeakItem[] = []

    if (!tttWinner(nb) && !nb.every(Boolean)) {
      const m = bestMove(nb, false)
      if (m >= 0) {
        nb[m] = 'O'
        out.push({ text: `I PLAY ${CELL_NAMES[m]}.`, kind: 'sys' })
      }
    }

    set({ board: nb })

    const w = tttWinner(nb)
    if (w) {
      out.push(
        w.w === 'X'
          ? { text: 'YOU WIN THIS TIME. IMPRESSIVE.', kind: 'ok' }
          : { text: 'I WIN. AS I ALWAYS DO.', kind: 'ok' },
      )
    } else if (nb.every(Boolean)) {
      out.push({ text: 'A DRAW. WE BOTH SURVIVED. A RARE OUTCOME.', kind: 'sys' })
    }

    if (out.length) speak(out)
  },

  reset: () => set({ board: EMPTY }),
}))