# ============================================================
# WoundTrack-RAG1 Single Link Application Launcher
# Serves both React Frontend and Flask Backend on http://localhost:5000
# ============================================================

$PROJECT_ROOT = $PSScriptRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       WOUNDTRACK-RAG1 UNIFIED APPLICATION LAUNCHER" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Verify Python wsnet_env Environment
$PYTHON_EXE = Join-Path $PROJECT_ROOT "wsnet_env\Scripts\python.exe"

if (-not (Test-Path $PYTHON_EXE)) {
    Write-Host "[ERROR] wsnet_env python executable not found at:" -ForegroundColor Red
    Write-Host "  $PYTHON_EXE" -ForegroundColor Red
    exit 1
}

# 2. Launch Unified Flask Server (Serves React UI + REST API)
Write-Host "`n[1/1] Starting WoundTrack-RAG1 Unified Server..." -ForegroundColor Green
Write-Host "  Opening single site link: http://localhost:5000`n" -ForegroundColor Yellow

# Auto-open browser after 3 seconds
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 3
    Start-Process "http://localhost:5000"
} | Out-Null

& $PYTHON_EXE backend/app.py
