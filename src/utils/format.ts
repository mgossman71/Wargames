export const pad2 = (n: number) => (n < 10 ? '0' + n : '' + n)
export const pad3 = (n: number) => (n < 10 ? '00' + n : n < 100 ? '0' + n : '' + n)

export function two(n: number) {
  return n.toString().padStart(2, '0')
}

/** "14:32:07Z" style timestamp from a Date. */
export function zulu(d: Date = new Date()) {
  return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())}Z`
}

/** "13 SEP 1983" style date. */
export function dateLong(d: Date = new Date()) {
  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ]
  return `${pad2(d.getUTCDate())} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export function fmtDegMin(value: number, isLat: boolean) {
  const dir = isLat ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W'
  const abs = Math.abs(value)
  const deg = Math.floor(abs)
  const min = Math.round((abs - deg) * 60)
  return `${pad2(deg)}\u00b0${pad2(min)}'${dir}`
}

export function fmtNum(n: number, digits = 0) {
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}
