# Launcher for React + Vite Frontend Server
$PROJECT_ROOT = $PSScriptRoot
$FRONTEND_DIR = Join-Path $PROJECT_ROOT "frontend"

Write-Host "Starting WoundTrack-RAG1 Frontend Server on http://localhost:5173..." -ForegroundColor Cyan
Set-Location $FRONTEND_DIR
npm run dev
