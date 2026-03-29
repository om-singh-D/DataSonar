$ErrorActionPreference = 'Stop'

Write-Host "[DataSonar] Stopping Docker services..." -ForegroundColor Cyan
docker compose down --remove-orphans

Write-Host "[DataSonar] Stopped. If frontend dev server is still running, close its terminal window." -ForegroundColor Green
