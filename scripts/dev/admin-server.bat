@echo off
cd /d "%~dp0..\.."
title Admin Server
call "%~dp0ensure-dependencies.bat"
if errorlevel 1 exit /b 1
npm run admin:server
