import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { runSelfCheck } from '@/lib/selfCheck'
import './index.css'

if (import.meta.env.DEV) {
  try {
    const logs = runSelfCheck()
    console.info('[PackSmart self-check]', logs.join(' | '))
  } catch (error) {
    console.error('[PackSmart self-check failed]', error)
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
