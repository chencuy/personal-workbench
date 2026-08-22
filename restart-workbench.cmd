@echo off
setlocal

set "WORKBENCH_DIR=%~dp0"
set "WORKBENCH_PORT=5180"
set "WORKBENCH_OPEN_BROWSER=1"

for /f "delims=" %%P in ('powershell.exe -NoLogo -NoProfile -NonInteractive -Command "$port = 5180; try { $settings = Get-Content -Raw -LiteralPath (Join-Path $env:WORKBENCH_DIR '.workbench-data\server.json') | ConvertFrom-Json; if ($settings.port) { $port = [int]$settings.port } } catch {}; $port"') do set "WORKBENCH_PORT=%%P"
if not "%~1"=="" set "WORKBENCH_PORT=%~1"
if /I "%~2"=="--no-browser" set "WORKBENCH_OPEN_BROWSER=0"

echo Stopping the current Personal Workbench service...
powershell.exe -NoLogo -NoProfile -NonInteractive -Command "$root = [IO.Path]::GetFullPath($env:WORKBENCH_DIR).TrimEnd('\'); Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -like ('*' + $root + '*') -and $_.CommandLine -match '[\\/]vite(\.js)?' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"

echo Starting Personal Workbench on 127.0.0.1:%WORKBENCH_PORT%...
powershell.exe -NoLogo -NoProfile -NonInteractive -Command "$node = (Get-Command node.exe -ErrorAction Stop).Source; $vite = Join-Path $env:WORKBENCH_DIR 'node_modules\vite\bin\vite.js'; $data = Join-Path $env:WORKBENCH_DIR '.workbench-data'; New-Item -ItemType Directory -Force -Path $data | Out-Null; $arguments = @(('"' + $vite + '"'), '--host', '127.0.0.1', '--port', $env:WORKBENCH_PORT, '--strictPort'); Start-Process -FilePath $node -ArgumentList $arguments -WorkingDirectory $env:WORKBENCH_DIR -WindowStyle Hidden -RedirectStandardOutput (Join-Path $data 'service.stdout.log') -RedirectStandardError (Join-Path $data 'service.stderr.log')"

powershell.exe -NoLogo -NoProfile -NonInteractive -Command "$url = 'http://127.0.0.1:%WORKBENCH_PORT%/'; foreach ($attempt in 1..30) { try { $null = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 1; if ($env:WORKBENCH_OPEN_BROWSER -eq '1') { Start-Process $url }; exit 0 } catch { Start-Sleep -Milliseconds 500 } }; exit 1"

if errorlevel 1 (
  echo.
  echo The service did not become ready in time.
  echo Check whether npm and the project dependencies are available.
  pause
  exit /b 1
)

echo Personal Workbench restarted successfully.
exit /b 0
