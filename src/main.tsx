// ============================================================
// main.tsx — Application entry point
// Mounts the React app into the #root div in index.html.
// Imports global CSS (Tailwind + custom styles).
// ============================================================

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'  // Tailwind directives + global styles

// React.StrictMode runs component render twice in development
// to catch side effects — disabled automatically in production builds.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
