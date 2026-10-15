@echo off
setlocal

set "PROJECT_ROOT=%~dp0"

start "Platform Backend" /D "%PROJECT_ROOT%backend" cmd /k "npm start"
start "Platform Frontend" /D "%PROJECT_ROOT%frontend" cmd /k "npm start"

endlocal
