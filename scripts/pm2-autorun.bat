@echo off
REM DPPI — restore PM2 processes after Windows boot
set "PM2_HOME=C:\ProgramData\atk-pm2"
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "C:\portal-dppi"

if not exist "logs" mkdir logs

echo [%date% %time%] PM2 autorun starting >> "logs\pm2-autorun.log"
"C:\Program Files\nodejs\node.exe" "C:\portal-dppi\node_modules\pm2\bin\pm2" resurrect >> "logs\pm2-autorun.log" 2>&1
echo [%date% %time%] PM2 autorun exit=%ERRORLEVEL% >> "logs\pm2-autorun.log"
