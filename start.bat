@echo off
echo === StageLink - Demarrage ===
echo.

where php >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    set "PATH=C:\wamp64\bin\php\php8.3.28;%PATH%"
)

echo [1/2] Demarrage du backend (Laravel)...
start "StageLink Backend" cmd /c "cd /d %~dp0backend && php artisan serve --port=8000"
echo   -^> API sur http://localhost:8000

echo [2/2] Demarrage du frontend (Vite)...
start "StageLink Frontend" cmd /c "cd /d %~dp0frontend && npm run dev"
echo   -^> Frontend sur http://localhost:5173

echo.
echo === StageLink pret ! ===
echo Backend  : http://localhost:8000
echo Frontend : http://localhost:5173
echo Fermez les fenetres pour arreter les serveurs.
pause
