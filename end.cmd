@echo off
setlocal

rem Stop this Personal Workbench service without leaving a console window open.
wscript.exe "%~dp0end-workbench.vbs"
exit /b 0
