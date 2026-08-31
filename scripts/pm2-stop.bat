@echo off
cd /d "%~dp0\.."

echo ==========================================
echo  DPPI - PM2 stop
echo ==========================================
echo.

call pnpm exec pm2 stop dppi
if errorlevel 1 (
  echo Gagal stop. Cek status: pnpm exec pm2 status
  goto end
)

echo.
echo Proses "dppi" dihentikan.
echo   Status:  pnpm exec pm2 status
echo   Start:   pnpm pm2:start
echo.

:end
pause
