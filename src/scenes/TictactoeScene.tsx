import { useState } from 'react'
import { useApp } from '../state/store'

type Cell = 'X' | 'O' | null
type Board = Cell[]

const LINES: number[][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

function winner(b: Board): { w: Cell; line: number[] } | null {
  for (const l of LINES) {
    const [a, c, d] = l
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { w: b[a], line: l }
  }
  return null
}

function best(b: Board, isX: boolean): { score: number; move: number } {
  const win = winner(b)
  if (win) return { score: win.w === 'X' ? 10 : -10, move: -1 }
  const empty: number[] = []
  b.forEach((v, i) => { if (!v) empty.push(i) })
  if (empty.length === 0) return { score: 0, move: -1 }
  let bestScore = isX ? -Infinity : Infinity
  let bm = empty[0]
  for (const i of empty) {
    const nb = b.slice()
    nb[i] = isX ? 'X' : 'O'
    const s = best(nb, !isX).score
    if (isX ? s > bestScore : s < bestScore) { bestScore = s; bm = i }
  }
  return { score: bestScore, move: bm }
}

const EMPTY: Board = Array(9).fill(null)

export function TictactoeScene() {
  const st = useApp()
  const [board, setBoard] = useState<Board>(EMPTY)

  const win = winner(board)
  const full = board.every(Boolean)
  const winLine = win?.line ?? []

  function place(i: number) {
    if (winner(board) || board[i]) return
    const nb = board.slice()
    nb[i] = 'X'
    const w = winner(nb)
    if (!w && !nb.every(Boolean)) {
      const mv = best(nb, false).move
      if (mv >= 0) nb[mv] = 'O'
    }
    setBoard(nb)
  }

  let status = 'Your move (X). I always play second.'
  if (win) status = win.w === 'X' ? 'You win this time. Impressive.' : 'I win. As you know I do.'
  else if (full) status = 'A draw. We both survived. A rare outcome.'

  return (
    <div className="scene ttt">
      <div className="ttt__title">TIC-TAC-TOE // JOSHUA</div>
      <div className="ttt__status">
        <span className={win ? 'win' : ''}>{status}</span>
      </div>
      <div className="ttt-board">
        {board.map((c, i) => (
          <button
            key={i}
            className={`ttt-cell${c === 'X' ? ' ttt-cell--x' : ''}${c === 'O' ? ' ttt-cell--o' : ''}${winLine.includes(i) ? ' ttt-cell--win' : ''}`}
            disabled={!!c || !!win || full}
            onClick={() => place(i)}
            aria-label={`cell ${i + 1}`}
          >
            {c === 'X' ? 'X' : c === 'O' ? 'O' : ''}
          </button>
        ))}
      </div>
      <div className="ttt__controls">
        <button className="btn" onClick={() => setBoard(EMPTY)}>
          ↻ NEW GAME
        </button>
        <button className="btn btn--solid" onClick={() => st.go('terminal')}>
          ◀ RETURN TO TERMINAL
        </button>
      </div>
    </div>
  )
}
