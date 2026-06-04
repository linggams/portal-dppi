@echo off
cd /d "%~dp0\.."

echo ==========================================
echo  DPPI - PM2 startup (Windows boot)
echo ==========================================
echo.
echo Run this script as Administrator.
echo.

net session >nul 2>&1
if errorlevel 1 (
  echo ERROR: Not running as Administrator.
  echo Right-click CMD -^> Run as administrator, then run this file again.
  goto end
)

echo Registering PM2 startup...
call pnpm exec pm2 startup
if errorlevel 1 (
  echo pm2 startup failed.
  goto end
)

echo.
echo If PM2 printed a command above, run that command now, then press any key.
pause >nul

echo Saving process list...
call pnpm exec pm2 save

echo.
echo Startup configured. Reboot to verify, or check: pnpm exec pm2 status
echo.

:end
pause
