// Final-simulation scenarios (names inspired by the film's display wall).
// Each scenario encodes a DIFFERENT visual pattern for the missile engine.
// All patterns are fictional cinematic visualization — not targeting models.
export type LaunchStyle = 'polar' | 'submarine' | 'continental' | 'regional' | 'retaliatory'

export interface Scenario {
  name: string
  code: string
  from: ('us' | 'ussr')[]
  launchRegions: string[]
  targetRegions: string[]
  style: LaunchStyle
  /** base trajectory count (scaled by quality + escalation) */
  count: number
  /** 0..1 intensity (drives speed/impact frequency) */
  heat: number
}

export const SCENARIOS: Scenario[] = [
  {
    name: 'USSR FIRST STRIKE',
    code: 'SCN-01',
    from: ['ussr'],
    launchRegions: ['su-north', 'su-midland', 'su-west'],
    targetRegions: ['us-west', 'us-central', 'us-east', 'us-command'],
    style: 'polar',
    count: 46,
    heat: 0.9,
  },
  {
    name: 'U.S. FIRST STRIKE',
    code: 'SCN-02',
    from: ['us'],
    launchRegions: ['us-west', 'us-central', 'us-east'],
    targetRegions: ['su-west', 'su-central', 'su-east'],
    style: 'continental',
    count: 42,
    heat: 0.9,
  },
  {
    name: 'NATO / WARSAW PACT',
    code: 'SCN-03',
    from: ['us', 'ussr'],
    launchRegions: ['su-midland', 'su-west', 'us-east'],
    targetRegions: ['su-west', 'us-east', 'su-midland'],
    style: 'regional',
    count: 64,
    heat: 0.8,
  },
  {
    name: 'FAR EAST STRATEGY',
    code: 'SCN-04',
    from: ['ussr', 'us'],
    launchRegions: ['su-fareast', 'us-pacific'],
    targetRegions: ['us-pacific', 'us-west', 'su-fareast'],
    style: 'submarine',
    count: 40,
    heat: 0.7,
  },
  {
    name: 'U.S. / USSR ESCALATION',
    code: 'SCN-05',
    from: ['us', 'ussr'],
    launchRegions: ['su-north', 'su-central', 'us-west', 'us-east'],
    targetRegions: ['us-west', 'su-east', 'us-command', 'su-central'],
    style: 'retaliatory',
    count: 96,
    heat: 1.0,
  },
  {
    name: 'MIDDLE EAST WAR',
    code: 'SCN-06',
    from: ['ussr', 'us'],
    launchRegions: ['su-midland', 'su-west', 'us-east'],
    targetRegions: ['su-midland', 'us-east', 'su-west'],
    style: 'regional',
    count: 34,
    heat: 0.6,
  },
  {
    name: 'INDIA / PAKISTAN WAR',
    code: 'SCN-07',
    from: ['ussr'],
    launchRegions: ['su-central'],
    targetRegions: ['su-central', 'su-east'],
    style: 'regional',
    count: 28,
    heat: 0.55,
  },
  {
    name: 'MEDITERRANEAN WAR',
    code: 'SCN-08',
    from: ['ussr', 'us'],
    launchRegions: ['su-midland', 'us-atlantic'],
    targetRegions: ['su-midland', 'us-atlantic'],
    style: 'submarine',
    count: 26,
    heat: 0.5,
  },
  {
    name: 'PACIFIC TERRITORIAL',
    code: 'SCN-09',
    from: ['us', 'ussr'],
    launchRegions: ['us-pacific', 'su-fareast'],
    targetRegions: ['us-pacific', 'su-fareast', 'us-west'],
    style: 'submarine',
    count: 48,
    heat: 0.7,
  },
  {
    name: 'ICELAND MAXIMUM',
    code: 'SCN-10',
    from: ['ussr', 'us'],
    launchRegions: ['su-north', 'us-atlantic', 'su-midland'],
    targetRegions: ['us-atlantic', 'su-north', 'us-east'],
    style: 'polar',
    count: 58,
    heat: 0.85,
  },
  {
    name: 'NATO TERRITORIAL',
    code: 'SCN-11',
    from: ['us', 'ussr'],
    launchRegions: ['us-east', 'su-west'],
    targetRegions: ['us-east', 'su-west', 'us-atlantic'],
    style: 'continental',
    count: 44,
    heat: 0.7,
  },
  {
    name: 'MIDDLE EAST HEAVY',
    code: 'SCN-12',
    from: ['ussr', 'us'],
    launchRegions: ['su-midland', 'su-central', 'us-east'],
    targetRegions: ['su-midland', 'su-central', 'us-east', 'us-command'],
    style: 'retaliatory',
    count: 84,
    heat: 0.95,
  },
]
