# Launcher for Flask Backend API Server
$PROJECT_ROOT = $PSScriptRoot
$PYTHON_EXE = Join-Path $PROJECT_ROOT "wsnet_env\Scripts\python.exe"

Write-Host "Starting WoundTrack-RAG1 Backend Server on http://localhost:5000..." -ForegroundColor Cyan
& $PYTHON_EXE backend/app.py
