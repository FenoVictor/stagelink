Write-Host "=== StageLink - Démarrage ===" -ForegroundColor Cyan
Write-Host ""

# Vérifier PHP
if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
    Write-Error "PHP introuvable. Ajoutez PHP à votre PATH."
    exit 1
}

# Vérifier Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js introuvable."
    exit 1
}

Write-Host "[1/2] Démarrage du backend (Laravel)..." -ForegroundColor Yellow
$backend = Start-Process -FilePath "php" -ArgumentList "artisan serve --port=8000" -NoNewWindow -PassThru -WorkingDirectory "$PSScriptRoot\backend"
Write-Host "  -> API sur http://localhost:8000" -ForegroundColor Green

Write-Host "[2/2] Démarrage du frontend (Vite)..." -ForegroundColor Yellow
$frontend = Start-Process -FilePath "npx" -ArgumentList "vite --port=5173" -NoNewWindow -PassThru -WorkingDirectory "$PSScriptRoot\frontend"
Write-Host "  -> Frontend sur http://localhost:5173" -ForegroundColor Green

Write-Host ""
Write-Host "=== StageLink prêt ! ===" -ForegroundColor Cyan
Write-Host "Backend : http://localhost:8000" -ForegroundColor Green
Write-Host "Frontend : http://localhost:5173" -ForegroundColor Green
Write-Host "Fermez ce terminal pour arrêter les serveurs." -ForegroundColor Gray

$backend.WaitForExit()
$frontend.WaitForExit()
