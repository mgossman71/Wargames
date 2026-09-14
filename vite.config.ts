import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// WarGames / WOPR — Vite 6 + React 18 + TypeScript
export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 8080, strictPort: false },
  preview: { host: true, port: 8080, strictPort: false },
  build: {
    outDir: 'dist',
    target: 'es2020',
    chunkSizeWarningLimit: 4000,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (
            id.includes('node_modules/d3-geo') ||
            id.includes('world-atlas') ||
            id.includes('topojson')
          )
            return 'geo'
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/scheduler')
          )
            return 'vendor'
          if (id.includes('node_modules/zustand')) return 'state'
          return undefined
        }
      }
    }
  }
})
