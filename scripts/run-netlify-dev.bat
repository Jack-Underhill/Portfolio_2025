@echo off
set VITE_ENABLE_NETLIFY_FUNCTIONS=true
netlify dev --port 8888 --target-port 5174 --command "npm run dev -- --port 5174 --strictPort"
pause
