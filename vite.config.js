import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const PROJECT_VIDEO_DEBUG_ENDPOINT = '/__project-video-debug'

function projectVideoDebugLogger() {
  return {
    name: 'project-video-debug-logger',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(PROJECT_VIDEO_DEBUG_ENDPOINT, (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }

        let body = ''
        req.setEncoding('utf8')
        req.on('data', (chunk) => {
          body += chunk
        })
        req.on('end', () => {
          try {
            const payload = JSON.parse(body)
            console.info(payload.line || '[project-video] malformed payload')
          } catch {
            console.info('[project-video] unreadable debug payload')
          }

          res.statusCode = 204
          res.end()
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    projectVideoDebugLogger(),
    react(),
    tailwindcss(),
  ],
})
