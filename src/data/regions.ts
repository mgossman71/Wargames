// Fictional, SIMPLIFIED target regions for the cinematic simulation only.
// These are broad lat/lng areas used purely for visual launch/impact placement.
// They are NOT real targeting data, force structures, or operational information.
export interface Region {
  id: string
  label: string
  code: string
  side: 'us' | 'ussr'
  lat: number
  lng: number
  /** angular dispersion (degrees) for scattering individual points */
  spread: number
}

export const REGIONS: Region[] = [
  // ---- United States (broad regions) ----
  { id: 'us-west', label: 'WESTERN REGION', code: 'US-WST', side: 'us', lat: 45.0, lng: -120.0, spread: 7 },
  { id: 'us-central', label: 'CENTRAL REGION', code: 'US-CEN', side: 'us', lat: 40.0, lng: -100.0, spread: 8 },
  { id: 'us-east', label: 'EASTERN REGION', code: 'US-EAST', side: 'us', lat: 39.0, lng: -77.0, spread: 7 },
  { id: 'us-pacific', label: 'PACIFIC REGION', code: 'US-PAC', side: 'us', lat: 21.0, lng: -158.0, spread: 6 },
  { id: 'us-atlantic', label: 'NORTH ATLANTIC', code: 'US-ATL', side: 'us', lat: 44.0, lng: -40.0, spread: 9 },
  { id: 'us-command', label: 'COMMAND NETWORK', code: 'US-CMD', side: 'us', lat: 35.0, lng: -85.0, spread: 6 },

  // ---- Soviet Union / Eurasia (broad regions) ----
  { id: 'su-west', label: 'WESTERN REGION', code: 'SU-WST', side: 'ussr', lat: 52.0, lng: 38.0, spread: 7 },
  { id: 'su-central', label: 'CENTRAL REGION', code: 'SU-CEN', side: 'ussr', lat: 50.0, lng: 58.0, spread: 9 },
  { id: 'su-east', label: 'EASTERN REGION', code: 'SU-EAST', side: 'ussr', lat: 55.0, lng: 100.0, spread: 11 },
  { id: 'su-north', label: 'POLAR STRIKERS', code: 'SU-NOR', side: 'ussr', lat: 70.0, lng: 62.0, spread: 9 },
  { id: 'su-fareast', label: 'FAR EAST SUBMARINES', code: 'SU-FAE', side: 'ussr', lat: 54.0, lng: 156.0, spread: 9 },
  { id: 'su-midland', label: 'MIDLAND SUBMARINES', code: 'SU-MID', side: 'ussr', lat: 55.0, lng: 24.0, spread: 8 },
]

export const regionsForSide = (side: 'us' | 'ussr') => REGIONS.filter((r) => r.side === side)
