@echo off
cd /d "%~dp0..\.."
title Vite Server
call "%~dp0ensure-dependencies.bat"
if errorlevel 1 exit /b 1

echo Starting Vite on all local network interfaces...
echo Use the "Network" URL printed by Vite on a phone connected to the same Wi-Fi.
echo If Windows Firewall prompts you, allow access for Node.js on private networks.
echo.

npm run dev -- --host 0.0.0.0
