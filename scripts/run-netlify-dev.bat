@echo off
call "%~dp0dev\ensure-dependencies.bat"
if errorlevel 1 exit /b 1

set VITE_ENABLE_NETLIFY_FUNCTIONS=true
netlify dev --port 8888 --target-port 5174 --command "npm run dev -- --port 5174 --strictPort"
pause
