@echo off
cd /d "%~dp0..\.."

if "%PORTFOLIO_DEPS_READY%"=="1" exit /b 0

if not exist package.json (
  echo Could not find package.json from %CD%.
  exit /b 1
)

echo Syncing npm packages with package.json/package-lock.json...
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo npm install failed. Fix the install error above, then start dev again.
  exit /b 1
)

set "PORTFOLIO_DEPS_READY=1"
echo npm packages are up to date.
