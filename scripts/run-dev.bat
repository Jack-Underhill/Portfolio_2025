@echo off
set "ROOT=%~dp0.."
set "DEV_SCRIPTS=%~dp0dev"

wt ^
  new-tab   -d "%ROOT%" --title "Admin Server" --suppressApplicationTitle cmd /k call "%DEV_SCRIPTS%\admin-server.bat" ^
  ; new-tab -d "%ROOT%" --title "Vite Server"  --suppressApplicationTitle cmd /k call "%DEV_SCRIPTS%\vite-server.bat" ^
  ; new-tab -d "%ROOT%" --title "Workspace"    --suppressApplicationTitle cmd /k call "%DEV_SCRIPTS%\workspace.bat"

start chrome "https://github.com/Jack-Underhill/Portfolio_2025"
start chrome "http://localhost:5173/admin/"
start chrome "http://localhost:5173/"
start explorer "%ROOT%"
