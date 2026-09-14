/// <reference types="vite/client" />

// Allow importing raw GeoJSON / TopoJSON data from the world-atlas package.
declare module 'world-atlas/countries-110m.json' {
  const value: unknown
  export default value
}
declare module 'world-atlas/countries-50m.json' {
  const value: unknown
  export default value
}

// Ambient audio files (drop-in placeholders) — resolved by Vite's client types.
