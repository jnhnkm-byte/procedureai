$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)

Write-Host "[ProcureAI] Local startup" -ForegroundColor Cyan
Write-Host "Node: $(node -v)"
Write-Host "npm : $(npm -v)"

if (-not (Test-Path "node_modules")) {
  Write-Host "Installing dependencies..." -ForegroundColor Yellow
  npm install
}

$server = Start-Process -FilePath "cmd.exe" -ArgumentList '/k', 'npm run dev' -WorkingDirectory (Get-Location) -PassThru
Write-Host "Starting development server..." -ForegroundColor Yellow

$ready = $false
for ($i = 0; $i -lt 60; $i++) {
  Start-Sleep -Seconds 1
  try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:3000/" -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
      $ready = $true
      break
    }
  } catch {
    # keep waiting while Next.js starts
  }
}

if (-not $ready) {
  Write-Host "Could not connect to http://localhost:3000/" -ForegroundColor Red
  Write-Host "Check the server window for the exact error." -ForegroundColor Red
  exit 1
}

Write-Host "ProcureAI is ready: http://localhost:3000/" -ForegroundColor Green
Start-Process "http://localhost:3000/"
