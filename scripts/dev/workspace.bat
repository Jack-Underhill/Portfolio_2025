@echo off
cd /d "%~dp0..\.."
title Workspace

powershell -NoProfile -Command "Write-Host 'Opening workspace in VS Code...' -ForegroundColor Cyan"
call code .

powershell -NoProfile -Command "Write-Host 'Fetching latest refs from origin...' -ForegroundColor DarkCyan"
git fetch origin

powershell -NoProfile -Command "Write-Host 'Current git status...' -ForegroundColor Blue"
git status
