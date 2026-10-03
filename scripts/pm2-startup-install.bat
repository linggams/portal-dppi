@echo off
cd /d "%~dp0\.."

echo ==========================================
echo  DPPI - PM2 autorun (Windows boot)
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

echo [1/3] Ensuring process list is saved...
call pnpm exec pm2 save
if errorlevel 1 (
  echo WARNING: pm2 save failed. Start the app first: scripts\pm2-setup.bat
)

echo.
echo [2/3] Registering Scheduled Task "DPPI-PM2"...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$taskName='DPPI-PM2';" ^
  "Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue;" ^
  "$action=New-ScheduledTaskAction -Execute '%CD%\scripts\pm2-autorun.bat' -WorkingDirectory '%CD%';" ^
  "$trigger=New-ScheduledTaskTrigger -AtStartup; $trigger.Delay='PT1M';" ^
  "$settings=New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 10) -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1);" ^
  "$principal=New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest;" ^
  "Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description 'DPPI: auto-start Next.js via PM2 setelah Windows boot' | Out-Null;" ^
  "Get-ScheduledTask -TaskName $taskName | Format-List TaskName,State,Description"

if errorlevel 1 (
  echo Failed to register Scheduled Task.
  goto end
)

echo.
echo [3/3] Done.
echo   Task: DPPI-PM2 ^(At startup, delay 1 menit^)
echo   Script: scripts\pm2-autorun.bat
echo   Cek: schtasks /Query /TN DPPI-PM2
echo.

:end
pause
