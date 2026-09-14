import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.css'
import './styles/crt.css'
import './styles/scenes.css'

const container = document.getElementById('root')
if (!container) {
  throw new Error('Missing #root mount node')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)