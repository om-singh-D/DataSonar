$ErrorActionPreference = 'Stop'

function Wait-KafkaHealthy {
    param(
        [int]$MaxAttempts = 30
    )

    for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
        $statusRaw = docker inspect -f "{{.State.Status}}" datasonar-kafka 2>$null
        $healthRaw = docker inspect -f "{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}" datasonar-kafka 2>$null

        if ($statusRaw) {
            $status = $statusRaw.Trim()
            $health = $healthRaw.Trim()

            if ($status -eq 'running' -and $health -eq 'healthy') {
                return $true
            }

            if ($status -eq 'exited') {
                return $false
            }
        }

        Start-Sleep -Seconds 2
    }

    return $false
}

function Test-KafkaClusterIdMismatch {
    $logs = docker logs datasonar-kafka --tail 200 2>&1 | Out-String
    return $logs -match 'InconsistentClusterIdException'
}

function Repair-KafkaClusterIdMismatch {
    docker compose rm -sf kafka kafka-ui | Out-Null
    docker volume rm datasonar_kafka-data | Out-Null
    docker compose up -d kafka kafka-ui | Out-Null
}

Write-Host "[DataSonar] Starting backend services..." -ForegroundColor Cyan
docker compose up -d postgres mongodb redis zookeeper kafka kafka-ui dashboard-api

Write-Host "[DataSonar] Checking Kafka health..." -ForegroundColor Cyan
if (-not (Wait-KafkaHealthy -MaxAttempts 30)) {
    if (Test-KafkaClusterIdMismatch) {
        Write-Host "[DataSonar] Kafka cluster metadata mismatch detected. Running self-heal..." -ForegroundColor Yellow
        Repair-KafkaClusterIdMismatch

        if (-not (Wait-KafkaHealthy -MaxAttempts 30)) {
            throw "Kafka self-heal ran, but kafka is still not healthy. Check: docker logs datasonar-kafka --tail 200"
        }
    } else {
        throw "Kafka failed to start. Check: docker logs datasonar-kafka --tail 200"
    }
}

Write-Host "[DataSonar] Kafka status: healthy" -ForegroundColor Green

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

Write-Host "[DataSonar] Launching ingestion dev server in a new terminal..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Set-Location "services/ingestion"; npm run dev'

Write-Host "[DataSonar] Launching frontend dev server in a new terminal..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Set-Location "frontend"; npm run dev'

Write-Host "[DataSonar] Done. Use .\stop-datasonar.ps1 to stop services." -ForegroundColor Green
