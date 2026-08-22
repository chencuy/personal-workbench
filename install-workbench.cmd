@echo off
setlocal
cd /d "%~dp0"

where node.exe >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found.
  echo Install Node.js 20.19 or newer, then run this installer again.
  pause
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Reinstall Node.js with npm enabled.
  pause
  exit /b 1
)

echo Installing Personal Workbench dependencies...
call npm ci
if errorlevel 1 (
  echo.
  echo Installation failed. Check the npm output above.
  pause
  exit /b 1
)

echo Starting Personal Workbench...
wscript.exe "%~dp0restart-workbench.vbs"
exit /b 0
