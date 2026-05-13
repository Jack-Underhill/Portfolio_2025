import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.jsx'
import AppAdmin from './admin/AppAdmin.jsx'
import ArchitectureViewer from './components/projects/viewer/ArchitectureViewer.jsx'

const isDev = import.meta.env.DEV;
const isAdminRoute = window.location.pathname.startsWith('/admin');
const isArchitectureViewerRoute = window.location.pathname === '/architecture-viewer';

const RootComponent = isArchitectureViewerRoute
  ? ArchitectureViewer
  : isDev && isAdminRoute
    ? AppAdmin
    : App;

document.title = isArchitectureViewerRoute
  ? 'Jack Underhill | Project Architecture'
  : (isDev && isAdminRoute) 
  ? 'Admin | Portfolio' 
  : (isDev)
    ? 'Dev | Portfolio'
    : 'Jack Underhill | Portfolio';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>,
)
