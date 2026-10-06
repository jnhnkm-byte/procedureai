@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo [ERROR] Node.js is not installed or not on PATH.
  echo Install Node.js 24 LTS, then run this file again.
  echo.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo.
  echo [ERROR] npm is not available.
  echo Reinstall Node.js 24 LTS and try again.
  echo.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\run-local.ps1"
if errorlevel 1 (
  echo.
  echo Local startup failed. See the error above.
  pause
)
