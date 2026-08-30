@echo off
setlocal

rem Start the service silently using the saved port configuration.
wscript.exe "%~dp0restart-workbench.vbs"
exit /b 0
