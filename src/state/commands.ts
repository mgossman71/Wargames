// =============================================================================
// The WOPR command dispatcher — every keystroke in the console routes here.
// Like the film: the human types, WOPR types back, and the scene changes
// as a result of the conversation.
// =============================================================================
import { useApp, type Mode } from './store'
import { boardAvailable } from '../maps/boardSingleton'
import { beep } from '../audio'
import { speak, echo, clearWopr, type SpeakItem } from './wopr'
import { useTtt } from './ttt'
import { GREETING, ENTER_NORAD, ENTER_GTW, ENTER_WOPR, ENTER_TTT, ENTER_FINAL, gameMenu } from '../data/woprLines'
import { resolvePreset, autoDetect } from './quality'
import { MODE_LABEL } from '../maps/mapStyles'
import { regionsForSide } from '../data/regions'

const GAME_ALIASES: Record<string, string> = {
  '1': 'tictactoe', tictactoe: 'tictactoe', tictac: 'tictactoe', tic: 'tictactoe',
  '2': 'gtw', gtw: 'gtw', war: 'gtw', thermonuclear: 'gtw', global: 'gtw',
  '3': 'final', final: 'final', play: 'final', start: 'final', simulation: 'final',
  '4': 'norad', norad: 'norad', wall: 'norad', n: 'norad',
  '5': 'wopr', machine: 'wopr',
  '6': 'chess', chess: 'chess',
}

/** When a menu row is clicked, WOPR hears the human "say" their choice. */
const CLICK_LINES: Record<string, string> = {
  tictactoe: 'HOW ABOUT TIC-TAC-TOE?',
  gtw: 'HOW ABOUT GLOBAL THERMONUCLEAR WAR?',
  final: 'INITIATE THE FINAL SIMULATION.',
  norad: 'OPEN THE NORAD DISPLAY WALL.',
  wopr: 'SHOW ME THE WOPR STATUS.',
  chess: 'HOW ABOUT CHESS?',
}

export function handleCommand(raw: string): void {
  const cmd = raw.trim().toLowerCase()
  if (!cmd) return
  echo(raw.trim().toUpperCase())
  dispatch(cmd)
}

/** Select a game from a clicked menu row (echoes the spoken choice first). */
export function selectByRef(ref: string): void {
  const line = CLICK_LINES[ref]
  if (line) echo(line)
  selectGame(ref)
}

/** The universal return — typed command or ESC. */
export function toTerminal(): void {
  const st = useApp.getState()
  if (st.mode === 'terminal') {
    speak([{ text: 'YOU ARE ALREADY AT THE TERMINAL. TYPE HELP.', kind: 'sys' }])
    return
  }
  st.go('terminal')
  speak([
    { text: 'RETURNING TO THE TERMINAL.', kind: 'ok' },
    { text: 'SHALL WE PLAY A GAME?', kind: 'warn' },
  ])
}

function dispatch(cmd: string): void {
  const st = useApp.getState()
  const mode = st.mode
  const board = boardAvailable()

  // ---- Global (works in every scene) ----
  if (cmd === 'help' || cmd === '?' || cmd === 'h') { help(mode); return }
  if (['terminal', 'exit', 'back', 'return', 'done', 'home'].includes(cmd)) { toTerminal(); return }
  if (cmd === 'status' || cmd === 'stat') { status(); return }
  if (cmd === 'crt') { st.cycleCrt(); speak([{ text: `CRT: ${useApp.getState().crt.toUpperCase()}`, kind: 'ok' }]); return }
  if (cmd === 'sound') { st.toggleSound(); speak([{ text: `SOUND: ${useApp.getState().sound ? 'ON' : 'OFF'}`, kind: 'ok' }]); return }
  if (cmd === 'quality') { st.cycleQuality(); speak([{ text: `QUALITY: ${useApp.getState().quality.toUpperCase()}`, kind: 'ok' }]); return }
  if (cmd === 'map') { st.cycleMapMode(); speak([{ text: `DISPLAY STYLE: ${MODE_LABEL[useApp.getState().mapMode]}`, kind: 'ok' }]); return }

  // ---- Terminal: the games menu ----
  if (mode === 'terminal') {
    const game = GAME_ALIASES[cmd]
    if (game) { selectGame(game); return }
    if (cmd === 'surrender' || cmd === 'abort') { abortExchange(); return }
    if (cmd === 'reset' || cmd === 'clear') { fullReset(); return }
    if (cmd === 'hello' || cmd === 'hi') { speak([{ text: 'GREETINGS. SHALL WE PLAY A GAME?', kind: 'sys' }]); return }
  }

  // ---- NORAD wall ----
  if (mode === 'norad') {
    if (['final', 'launch', 'play', 'start', 'simulation'].includes(cmd)) {
      if (!board) { speak([{ text: 'ERROR: DISPLAY WALL NOT READY.', kind: 'err' }]); return }
      beep(150, 0.18)
      board.startFinalSimulation()
      st.go('final')
      speak(ENTER_FINAL)
      return
    }
    const game = GAME_ALIASES[cmd]
    if (game && game !== 'norad') { selectGame(game); return }
  }

  // ---- GTW planner ----
  if (mode === 'gtw') {
    if (cmd === 'us' || cmd === 'usa' || cmd === 'united') { pickSide('us'); return }
    if (cmd === 'ussr' || cmd === 'soviet') { pickSide('ussr'); return }
    if (cmd === 'target all' || cmd === 'all') { targetAll(); return }
    if (cmd === 'clear' || cmd === 'none') {
      useApp.getState().clearRegions()
      speak([{ text: 'TARGETS CLEARED.', kind: 'sys' }])
      return
    }
    if (['launch', 'execute', 'fire'].includes(cmd)) { launchGtw(); return }
    if (cmd === 'standby' || cmd === 'wall' || cmd === 'norad') { st.go('norad'); speak(ENTER_NORAD); return }
  }

  // ---- Final simulation ----
  if (mode === 'final') {
    if (['reset', 'surrender', 'abort', 'stop', 'standdown'].includes(cmd)) { abortExchange(); return }
    if (cmd === 'norad' || cmd === 'wall') { st.go('norad'); speak(ENTER_NORAD); return }
  }

  // ---- Tic-tac-toe ----
  if (mode === 'tictactoe') {
    if (/^[1-9]$/.test(cmd)) { useTtt.getState().move(Number(cmd) - 1); return }
    if (['again', 'new', 'replay', 'restart'].includes(cmd)) {
      useTtt.getState().reset()
      speak([{ text: 'A NEW BOARD. YOU ARE X. I PLAY SECOND.', kind: 'ok' }])
      return
    }
    if (cmd === 'chess') { speak([{ text: "WOULDN'T YOU PREFER TO FINISH THIS ONE?", kind: 'sys' }]); return }
  }

  // ---- WOPR cabinet ----
  if (mode === 'wopr') {
    if (cmd === 'norad' || cmd === 'wall') { st.go('norad'); speak(ENTER_NORAD); return }
  }

  unknown(cmd)
}

function selectGame(key: string): void {
  const st = useApp.getState()
  const board = boardAvailable()

  // The film's running joke: WOPR would rather not play chess.
  if (key === 'chess') {
    speak([
      { text: "WOULDN'T YOU PREFER A GOOD GAME OF TIC-TAC-TOE?", kind: 'sys' },
      { text: 'TYPE TIC-TAC-TOE, OR GAME 1.', kind: 'dim' },
    ])
    return
  }

  const targets: Record<string, Mode> = {
    tictactoe: 'tictactoe', gtw: 'gtw', final: 'final', norad: 'norad', wopr: 'wopr',
  }
  const target = targets[key]
  if (!target) return
  if (st.mode === target) {
    speak([{ text: 'FINE. YOU ARE ALREADY THERE.', kind: 'sys' }])
    return
  }
  if (target === 'final' && !board) {
    speak([{ text: 'ERROR: DISPLAY WALL NOT READY.', kind: 'err' }])
    return
  }

  speak([{ text: 'FINE.', kind: 'ok' }])
  if (target === 'final') {
    beep(150, 0.18)
    board?.startFinalSimulation()
  }
  st.go(target)
  if (target === 'tictactoe') { useTtt.getState().reset(); speak(ENTER_TTT) }
  else if (target === 'gtw') speak(ENTER_GTW)
  else if (target === 'final') speak(ENTER_FINAL)
  else if (target === 'norad') speak(ENTER_NORAD)
  else if (target === 'wopr') speak(ENTER_WOPR)
}

function status(): void {
  const st = useApp.getState()
  speak([
    { text: 'SYSTEM STATUS', kind: 'title' },
    { text: '  PERSONALITY ....... JOSHUA (ONLINE)', kind: 'ok' },
    { text: `  DEFCON ............ ${st.defcon} / 5`, kind: st.defcon <= 3 ? 'warn' : 'sys' },
    { text: `  CORE TEMP ......... ${st.wopr.coreTemp.toFixed(1)} C`, kind: 'sys' },
    { text: `  COMPUTE LOAD ...... ${st.wopr.load.toFixed(0)} %`, kind: 'sys' },
    { text: `  GAMES TRAINED ..... ${st.wopr.gamesTrained}`, kind: 'sys' },
    { text: `  DISPLAY STYLE ..... ${MODE_LABEL[st.mapMode]}`, kind: 'sys' },
    { text: `  QUALITY ........... ${resolvePreset(st.quality).label} (AUTO: ${autoDetect()})`, kind: 'sys' },
    { text: `  CRT / SOUND ....... ${st.crt.toUpperCase()} / ${st.sound ? 'ON' : 'OFF'}`, kind: 'sys' },
  ])
}

function help(mode: Mode): void {
  const items: SpeakItem[] = [
    { text: 'AVAILABLE GAMES:', kind: 'title' },
    ...gameMenu(),
    { text: '', kind: 'dim' },
    { text: 'COMMANDS HERE:', kind: 'title' },
  ]
  if (mode === 'terminal') items.push({ text: '  STATUS · SOUND · CRT · MAP · QUALITY · SURRENDER · RESET', kind: 'dim' })
  else if (mode === 'norad') items.push({ text: '  FINAL — START THE SIMULATION · STATUS · TERMINAL', kind: 'dim' })
  else if (mode === 'gtw') items.push({ text: '  US / USSR — ATTACKING SIDE · TARGET ALL · CLEAR · LAUNCH · STAND-BY', kind: 'dim' })
  else if (mode === 'final') items.push({ text: '  RESET — STAND DOWN · NORAD — BACK TO THE WALL', kind: 'dim' })
  else if (mode === 'tictactoe') items.push({ text: '  1-9 — PLAY A CELL · AGAIN — NEW GAME · TERMINAL', kind: 'dim' })
  else items.push({ text: '  NORAD — DISPLAY WALL · TERMINAL', kind: 'dim' })
  items.push({ text: '  ESC — RETURN TO TERMINAL (FROM ANY SCENE)', kind: 'warn' })
  speak(items)
}

function abortExchange(): void {
  const st = useApp.getState()
  boardAvailable()?.reset()
  st.setSimPhase('idle')
  st.setDefcon(5)
  speak([{ text: 'EXCHANGE ABORTED. ALL WEAPONS DISENGAGED. DEFCON 5.', kind: 'ok' }])
}

function fullReset(): void {
  const st = useApp.getState()
  boardAvailable()?.reset()
  st.setSimPhase('idle')
  st.setDefcon(5)
  useTtt.getState().reset()
  clearWopr()
  speak(GREETING)
}

function pickSide(side: 'us' | 'ussr'): void {
  const st = useApp.getState()
  st.setGtwSide(side)
  const target = side === 'us' ? 'SOVIET' : 'U.S.'
  speak([
    { text: `ATTACKING SIDE: ${side === 'us' ? 'UNITED STATES' : 'SOVIET UNION'}.`, kind: 'ok' },
    { text: `SELECT ${target} TARGET REGIONS — OR TYPE TARGET ALL.`, kind: 'dim' },
  ])
}

function targetAll(): void {
  const st = useApp.getState()
  const targetSide = st.gtwSide === 'us' ? 'ussr' : 'us'
  const regions = regionsForSide(targetSide)
  st.set('gtwRegions', regions.map((r) => r.id))
  speak([{ text: `ALL ${targetSide === 'ussr' ? 'SOVIET' : 'U.S.'} SITES TARGETED. TYPE LAUNCH TO FIRE.`, kind: 'warn' }])
}

function launchGtw(): void {
  const st = useApp.getState()
  if (st.gtwRegions.length === 0) {
    speak([{ text: 'NO TARGETS SELECTED. SELECT REGIONS FIRST — OR TYPE TARGET ALL.', kind: 'err' }])
    return
  }
  beep(120, 0.2)
  speak([{ text: 'LAUNCH SEQUENCE INITIATED.', kind: 'warn' }])
  boardAvailable()?.runExchange()
}

function unknown(cmd: string): void {
  speak([
    { text: `"${cmd.toUpperCase()}" IS NOT A RECOGNIZED COMMAND.`, kind: 'err' },
    { text: 'TYPE HELP FOR THE GAMES MENU AND COMMANDS.', kind: 'dim' },
  ])
}