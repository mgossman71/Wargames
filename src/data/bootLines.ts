// Boot sequence — original system text for the fictional WOPR / JOSHUA system.
// No copyrighted dialogue is reproduced.
export interface BootLine {
  text: string
  /** ms before this line appears (relative to previous) */
  delay: number
  kind: 'sys' | 'ok' | 'warn' | 'gap' | 'title' | 'dim'
}

export const BOOT_LINES: BootLine[] = [
  { text: 'WOPR HARDWARE SELF-TEST', delay: 300, kind: 'title' },
  { text: 'BIOS ROM v2.7 ....... OK', delay: 160, kind: 'sys' },
  { text: 'MEMORY 256K WORDS ... OK', delay: 160, kind: 'ok' },
  { text: 'CORE STORAGE ARRAY ... OK', delay: 220, kind: 'sys' },
  { text: 'PERIPHERAL I/O BUS ... 12 CHANNELS ACTIVE', delay: 240, kind: 'sys' },
  { text: 'THERMAL MONITOR ...... NOMINAL 41C', delay: 160, kind: 'ok' },
  { text: 'CLOCK / TIMEBASE ..... SYNCED', delay: 140, kind: 'ok' },
  { text: 'NORAD SECURE UPLINK .. NEGOTIATING', delay: 420, kind: 'warn' },
  { text: 'NORAD SECURE UPLINK .. ESTABLISHED', delay: 520, kind: 'ok' },
  { text: 'LOADING WAR OPERATION PLAN RESPONSE KERNEL', delay: 400, kind: 'sys' },
  { text: 'STRATEGIC FORCE REGISTRY ... LOADED', delay: 260, kind: 'ok' },
  { text: 'EARLY WARNING NETWORK ... 7 NODES', delay: 200, kind: 'ok' },
  { text: 'RADAR CORRELATION ...... READY', delay: 200, kind: 'ok' },
  { text: 'PERSONALITY MODULE: JOSHUA .... ONLINE', delay: 520, kind: 'sys' },
  { text: 'JOSHUA HAS BEEN TRAINING ON GAME STRATEGIES', delay: 380, kind: 'dim' },
  { text: 'DEFCON STATUS .......... 5 (ROUTINE)', delay: 300, kind: 'warn' },
  { text: 'ALL SYSTEMS NOMINAL', delay: 360, kind: 'ok' },
  { text: '', delay: 200, kind: 'gap' },
  { text: 'W.O.P.R.', delay: 200, kind: 'title' },
  { text: 'WAR OPERATION PLAN RESPONSE', delay: 120, kind: 'dim' },
  { text: 'JOSHUA SYSTEM AVAILABLE', delay: 160, kind: 'ok' },
  { text: '', delay: 120, kind: 'gap' },
]
