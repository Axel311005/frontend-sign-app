import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import logoUrl from './assets/logo.png'

const favicon =
  document.querySelector<HTMLLinkElement>("link[rel='icon']") ??
  (() => {
    const link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
    return link
  })()

favicon.type = 'image/png'
favicon.href = logoUrl

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
