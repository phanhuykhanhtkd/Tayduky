@echo off
title Tay Du Ky Mobile - May chu
cd /d "%~dp0"
if not exist "%~dp0server.js" (
  echo.
  echo  [!] Ban dang chay file nay ben trong WinRAR.
  echo      Hay bam "Extract To" de giai nen ca thu muc taydu ra truoc,
  echo      roi vao thu muc da giai nen va bam dup CHAY-GAME.bat.
  echo.
  pause
  exit /b
)
if not exist "%~dp0game\data.js" (
  echo.
  echo  [!] Thieu thu muc "game". Hay giai nen DAY DU file zip roi chay lai.
  echo.
  pause
  exit /b
)
where node >/dev/null 2>nul
if errorlevel 1 (
  echo.
  echo  [!] Chua cai Node.js. Hay tai va cai ban LTS tai: https://nodejs.org
  echo      Cai xong, tat cua so nay va bam dup CHAY-GAME.bat lan nua.
  echo.
  start https://nodejs.org
  pause
  exit /b
)
node server.js
echo.
echo  May chu da dung. Bam phim bat ky de dong.
pause >nul
