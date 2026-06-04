@echo off
cd /d "%~dp0\.."

echo ==========================================
echo  DPPI - PM2 setup (build + start + save)
echo ==========================================
echo.

if not exist "logs" mkdir logs

echo [1/3] Building application...
call pnpm build
if errorlevel 1 (
  echo Build failed.
  goto end
)

echo.
echo [2/3] Starting PM2 process "dppi"...
call pnpm exec pm2 start ecosystem.config.cjs
if errorlevel 1 (
  echo PM2 start failed. Is pnpm install done?
  goto end
)

echo.
echo [3/3] Saving PM2 process list...
call pnpm exec pm2 save

echo.
echo Done. App should be on http://localhost:2000
echo   Status: pnpm exec pm2 status
echo   Logs:   pnpm pm2:logs
echo.
echo For auto-start on Windows boot, run as Administrator:
echo   scripts\pm2-startup-install.bat
echo.

:end
pause
