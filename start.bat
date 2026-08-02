@echo off
echo === StageLink - Demarrage ===
echo.

where php >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    set "PATH=C:\wamp64\bin\php\php8.3.28;%PATH%"
)

echo [1/3] Demarrage du backend (Laravel)...
start "StageLink Backend" cmd /c "cd /d %~dp0backend && php artisan serve --port=8000"
echo   -^> API sur http://localhost:8000

echo [2/3] Demarrage de Reverb (WebSocket)...
start "StageLink Reverb" cmd /c "cd /d %~dp0backend && php artisan reverb:start"
echo   -^> WebSocket sur http://localhost:8080

echo [3/4] Demarrage de la file d'attente (queue:work)...
start "StageLink Queue" cmd /c "cd /d %~dp0backend && php artisan queue:work"
echo   -^> Emails et jobs traites en arriere-plan

echo [4/4] Demarrage du frontend (Vite)...
start "StageLink Frontend" cmd /c "cd /d %~dp0frontend && npm run dev"
echo   -^> Frontend sur http://localhost:5173

echo.
echo === StageLink pret ! ===
echo Backend     : http://localhost:8000
echo WebSocket   : http://localhost:8080
echo Queue worker: actif (emails/jobs)
echo Frontend    : http://localhost:5173
echo Fermez les fenetres pour arreter les serveurs.
pause
