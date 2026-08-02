Write-Host "=== StageLink - Demarrage ===" -ForegroundColor Cyan
Write-Host ""

# Verifier PHP
if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
    Write-Error "PHP introuvable. Ajoutez PHP a votre PATH."
    exit 1
}

# Verifier Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js introuvable."
    exit 1
}

Write-Host "[1/3] Demarrage du backend (Laravel)..." -ForegroundColor Yellow
$backend = Start-Process -FilePath "php" -ArgumentList "artisan serve --port=8000" -NoNewWindow -PassThru -WorkingDirectory "$PSScriptRoot\backend"
Write-Host "  -> API sur http://localhost:8000" -ForegroundColor Green

Write-Host "[2/3] Demarrage de Reverb (WebSocket)..." -ForegroundColor Yellow
$reverb = Start-Process -FilePath "php" -ArgumentList "artisan reverb:start" -NoNewWindow -PassThru -WorkingDirectory "$PSScriptRoot\backend"
Write-Host "  -> WebSocket sur http://localhost:8080" -ForegroundColor Green

Write-Host "[3/3] Demarrage du frontend (Vite)..." -ForegroundColor Yellow
$frontend = Start-Process -FilePath "npx" -ArgumentList "vite --port=5173" -NoNewWindow -PassThru -WorkingDirectory "$PSScriptRoot\frontend"
Write-Host "  -> Frontend sur http://localhost:5173" -ForegroundColor Green

Write-Host ""
Write-Host "=== StageLink pret ! ===" -ForegroundColor Cyan
Write-Host "Backend     : http://localhost:8000" -ForegroundColor Green
Write-Host "WebSocket   : http://localhost:8080" -ForegroundColor Green
Write-Host "Frontend    : http://localhost:5173" -ForegroundColor Green
Write-Host "Fermez ce terminal pour arreter les serveurs." -ForegroundColor Gray

$backend.WaitForExit()
$reverb.WaitForExit()
$frontend.WaitForExit()
