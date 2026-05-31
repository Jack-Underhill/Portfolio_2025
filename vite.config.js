import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { projectVideoDebugLogger } from './src/logging/projectVideoDebugVitePlugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    projectVideoDebugLogger(),
    react(),
    tailwindcss(),
  ],
})
