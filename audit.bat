@echo off
echo =============================================
echo    Audit de securite avant release
echo =============================================
echo.

set FAIL=0

echo [1/6] Composer Audit
cd /d "%~dp0backend"
call composer audit --format=json
if errorlevel 1 (
    echo   [FAIL] Vulnerabilites Composer detectees
    set FAIL=1
) else (
    echo   [OK] Aucune vulnerabilite Composer
)
echo.

echo [2/6] npm Audit
cd /d "%~dp0frontend"
call npm audit --audit-level=high
if errorlevel 1 (
    echo   [FAIL] Vulnerabilites npm detectees
    set FAIL=1
) else (
    echo   [OK] Aucune vulnerabilite npm haute/critique
)
echo.

echo [3/6] Tests PHP
cd /d "%~dp0backend"
call C:\wamp64\bin\php\php8.3.28\php.exe artisan test
if errorlevel 1 (
    echo   [FAIL] Tests PHP echoues
    set FAIL=1
) else (
    echo   [OK] Tests PHP passes
)
echo.

echo [4/6] Tests Frontend
cd /d "%~dp0frontend"
call npx vitest run
if errorlevel 1 (
    echo   [FAIL] Tests Frontend echoues
    set FAIL=1
) else (
    echo   [OK] Tests Frontend passes
)
echo.

echo [5/6] Secrets Check
cd /d "%~dp0backend"
call C:\wamp64\bin\php\php8.3.28\php.exe artisan secrets:check
if errorlevel 1 (
    echo   [FAIL] Secrets exposes detectes
    set FAIL=1
) else (
    echo   [OK] Aucun secret expose
)
echo.

echo [6/6] Build Production
cd /d "%~dp0frontend"
call npm run build
if errorlevel 1 (
    echo   [FAIL] Build echoue
    set FAIL=1
) else (
    echo   [OK] Build reussi
)
echo.

cd /d "%~dp0"

if %FAIL% NEQ 0 (
    echo =============================================
    echo   RELEASE BLOQUEE - Corriger les erreurs
    echo =============================================
    exit /b 1
) else (
    echo =============================================
    echo   RELEASE AUTORISEE
    echo =============================================
    exit /b 0
)
