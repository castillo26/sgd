import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style/global.css'
import { Login } from './Login.jsx'

const root = createRoot(document.getElementById('root'))  
root.render(
  <StrictMode>
    <Login />
  </StrictMode>
)