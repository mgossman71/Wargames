// =============================================================================
// WOPR dialogue engine — ONE persistent conversation that WOPR types out
// line by line, character by character (the 1983 teletype model: the machine
// speaks, the human types). Scenes and commands push lines onto a shared
// queue; a single typing loop renders them, so the conversation survives
// scene changes exactly like the film's single WOPR machine.
// =============================================================================
import { create } from 'zustand'
import { tick } from '../audio'

export type LineKind = 'user' | 'sys' | 'ok' | 'warn' | 'err' | 'title' | 'dim' | 'big' | 'menu'

export interface WoprLine {
  id: number
  /** full intended text of the line */
  full: string
  /** portion typed out so far (grows while the engine types) */
  text: string
  kind: LineKind
  /** for 'menu' lines: the game key chosen when the row is clicked */
  ref?: string
}

export interface SpeakItem {
  text: string
  kind?: LineKind
  ref?: string
}

interface WoprState {
  lines: WoprLine[]
  /** true while the typing engine still has work */
  speaking: boolean
}

export const useWopr = create<WoprState>(() => ({ lines: [], speaking: false }))

let lid = 0
const nextId = () => ++lid
const queue: SpeakItem[] = []
let activeId: number | null = null
let timer: number | null = null

function schedule(delay: number) {
  if (timer !== null) window.clearTimeout(timer)
  timer = window.setTimeout(pump, delay)
}

function pump() {
  timer = null

  // 1) Keep typing the active line, one (sometimes two) characters at a time.
  if (activeId !== null) {
    const line = useWopr.getState().lines.find((l) => l.id === activeId)
    if (line && line.text.length < line.full.length) {
      const take = Math.min(line.full.length - line.text.length, Math.random() < 0.25 ? 2 : 1)
      const next = line.full.slice(0, line.text.length + take)
      useWopr.setState((s) => ({
        lines: s.lines.map((l) => (l.id === line.id ? { ...l, text: next } : l)),
      }))
      tick()
      schedule(14 + Math.random() * 24)
      return
    }
    activeId = null
  }

  // 2) Start the next queued line.
  const item = queue.shift()
  if (item) {
    const id = nextId()
    useWopr.setState((s) => ({
      lines: [...s.lines, { id, full: item.text, text: '', kind: item.kind ?? 'sys', ref: item.ref }],
      speaking: true,
    }))
    activeId = id
    schedule(60 + Math.random() * 140)
    return
  }

  // 3) Nothing left to say.
  useWopr.setState({ speaking: false })
}

/** Interrupt in-progress typing: complete the active line instantly. */
export function interruptTyping(): void {
  if (activeId === null) return
  useWopr.setState((s) => ({
    lines: s.lines.map((l) => (l.id === activeId ? { ...l, text: l.full } : l)),
  }))
  activeId = null
}

/** Queue WOPR lines to be typed out. With `instant`, they appear fully typed. */
export function speak(items: SpeakItem[], opts: { instant?: boolean } = {}): void {
  if (opts.instant) {
    const added: WoprLine[] = items.map((i) => ({
      id: nextId(),
      full: i.text,
      text: i.text,
      kind: i.kind ?? 'sys',
      ref: i.ref,
    }))
    useWopr.setState((s) => ({ lines: [...s.lines, ...added] }))
    return
  }
  queue.push(...items)
  useWopr.setState({ speaking: true })
  pump()
}

/** Echo the human's input as an immediate line (interrupting WOPR mid-speech). */
export function echo(text: string): void {
  interruptTyping()
  useWopr.setState((s) => ({
    lines: [...s.lines, { id: nextId(), full: text, text, kind: 'user' }],
  }))
}

/** Clear the whole conversation (full system reset). */
export function clearWopr(): void {
  if (timer !== null) window.clearTimeout(timer)
  timer = null
  queue.length = 0
  activeId = null
  useWopr.setState({ lines: [], speaking: false })
}