# OPERA - Launch Script (PowerShell)
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting OPERA - Intelligent Operations Assistant" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$workspace = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $workspace

$env:PYTHONPATH = "$workspace\backend"
$python = "$workspace\.venv\Scripts\python.exe"

Write-Host "Starting FastAPI Application Server..." -ForegroundColor Green
Write-Host "  -> Web App:       http://127.0.0.1:8000/" -ForegroundColor Yellow
Write-Host "  -> Swagger Docs:  http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host ""

& $python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
