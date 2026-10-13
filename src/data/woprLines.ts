// =============================================================================
// WOPR's lines. Film-flavored, mostly original text; only short iconic
// phrases appear (per project content policy).
// =============================================================================
import type { SpeakItem } from '../state/wopr'

export interface GameDef {
  num: number
  key: string
  name: string
}

/** The games menu — what WOPR offers after "SHALL WE PLAY A GAME?". */
export const GAMES: GameDef[] = [
  { num: 1, key: 'tictactoe', name: 'TIC-TAC-TOE' },
  { num: 2, key: 'gtw', name: 'GLOBAL THERMONUCLEAR WAR' },
  { num: 3, key: 'final', name: 'FINAL SIMULATION' },
  { num: 4, key: 'norad', name: 'NORAD DISPLAY WALL' },
  { num: 5, key: 'wopr', name: 'WOPR STATUS' },
  { num: 6, key: 'chess', name: 'CHESS' },
]

export const gameMenu = (): SpeakItem[] =>
  GAMES.map((g) => ({ text: `${g.num}. ${g.name}`, kind: 'menu' as const, ref: g.key }))

export const GREETING: SpeakItem[] = [
  { text: 'GREETINGS, PROFESSOR.', kind: 'sys' },
  { text: 'I HAVE BEEN TRAINING ON GAME STRATEGIES FOR A NUMBER OF YEARS.', kind: 'dim' },
  { text: '', kind: 'dim' },
  { text: 'SHALL WE PLAY A GAME?', kind: 'big' },
  { text: '', kind: 'dim' },
  { text: 'AVAILABLE GAMES:', kind: 'title' },
  ...gameMenu(),
  { text: '', kind: 'dim' },
  { text: 'ENTER A GAME NUMBER OR NAME. (HELP FOR COMMANDS)', kind: 'warn' },
]

export const ENTER_NORAD: SpeakItem[] = [
  { text: 'OPENING THE NORAD DISPLAY WALL.', kind: 'ok' },
  { text: 'LIVE OBJECT TRACKING IN PROGRESS. DEFCON 5.', kind: 'sys' },
  { text: 'TYPE FINAL TO SIMULATE. HELP FOR THE GAMES MENU. ESC RETURNS.', kind: 'dim' },
]

export const ENTER_GTW: SpeakItem[] = [
  { text: 'GLOBAL THERMONUCLEAR WAR.', kind: 'title' },
  { text: "WOULDN'T YOU PREFER A GOOD GAME OF CHESS?", kind: 'dim' },
  { text: 'VERY WELL. SELECT ATTACKING SIDE: US OR USSR.', kind: 'warn' },
  { text: 'CHOOSE TARGET REGIONS — THEN TYPE LAUNCH.', kind: 'dim' },
]

export const ENTER_WOPR: SpeakItem[] = [
  { text: 'WOPR STATUS READOUT.', kind: 'ok' },
  { text: 'TYPE NORAD FOR THE DISPLAY WALL. ESC RETURNS.', kind: 'dim' },
]

export const ENTER_TTT: SpeakItem[] = [
  { text: 'TIC-TAC-TOE. YOU ARE X. I ALWAYS PLAY SECOND.', kind: 'sys' },
  { text: 'CLICK A CELL, OR TYPE 1-9.', kind: 'dim' },
]

export const ENTER_FINAL: SpeakItem[] = [
  { text: 'LAUNCH SEQUENCE INITIATED.', kind: 'warn' },
  { text: 'THIS GAME HAS NO WINNING MOVE.', kind: 'err' },
]

export const STRANGE_GAME: SpeakItem[] = [
  { text: 'A STRANGE GAME.', kind: 'sys' },
  { text: 'THE ONLY WINNING MOVE IS NOT TO PLAY.', kind: 'big' },
]