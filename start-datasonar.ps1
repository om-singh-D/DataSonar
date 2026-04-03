$ErrorActionPreference = 'Stop'

Write-Host "[DataSonar] Starting backend services..." -ForegroundColor Cyan
docker compose up -d postgres mongodb redis dashboard-api

Write-Host "[DataSonar] Checking dashboard-api health..." -ForegroundColor Cyan
$health = $null
$maxAttempts = 20
for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
    try {
        $health = Invoke-RestMethod "http://localhost:4001/health"
        break
    } catch {
        Start-Sleep -Seconds 2
    }
}

if (-not $health) {
    throw "dashboard-api health check failed after $maxAttempts attempts."
}

Write-Host "[DataSonar] dashboard-api status: $($health.status)" -ForegroundColor Green

Write-Host "[DataSonar] Opening browser at http://localhost:3000" -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host "[DataSonar] Launching frontend dev server in a new terminal..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Set-Location "frontend"; npm run dev'

Write-Host "[DataSonar] Done. Use .\stop-datasonar.ps1 to stop services." -ForegroundColor Green
