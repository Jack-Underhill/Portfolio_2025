import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.jsx'
import AppAdmin from './admin/AppAdmin.jsx'

const isDev = import.meta.env.DEV;
const isAdminRoute = window.location.pathname.startsWith('/admin');

const RootComponent = isDev && isAdminRoute ? AppAdmin : App;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>,
)
