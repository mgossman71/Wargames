import { useTtt, tttWinner } from '../state/ttt'

/**
 * Tic-tac-toe — the film's board game, shown as a green grid. Cells may be
 * clicked, or typed (1-9); JOSHUA plays second and announces each move into
 * the WOPR console. NEW GAME is typed: AGAIN.
 */
export function TictactoeScene() {
  const board = useTtt((s) => s.board)
  const move = useTtt((s) => s.move)
  const win = tttWinner(board)
  const full = board.every(Boolean)
  const winLine = win?.line ?? []

  let status = 'YOUR MOVE (X). I ALWAYS PLAY SECOND.'
  if (win) status = win.w === 'X' ? 'YOU WIN THIS TIME. IMPRESSIVE.' : 'I WIN. AS I ALWAYS DO.'
  else if (full) status = 'A DRAW. WE BOTH SURVIVED. A RARE OUTCOME.'

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
            onClick={() => move(i)}
            aria-label={`cell ${i + 1}`}
          >
            {c === 'X' ? 'X' : c === 'O' ? 'O' : ''}
          </button>
        ))}
      </div>
      <div className="ttt__hint">CLICK A CELL OR TYPE 1-9 · AGAIN FOR A NEW GAME · ESC RETURNS</div>
    </div>
  )
}