# Run backend API (SQLite — no PostgreSQL required)
$python = @(
    "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe",
    "python"
) | Where-Object { Test-Path $_ -or $_ -eq "python" } | Select-Object -First 1

Set-Location $PSScriptRoot
if (-not (Test-Path ".\venv")) {
    & $python -m venv venv
}
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt -q
if (-not (Test-Path ".\inventory.db")) {
    & python seed.py
}
Write-Host "API: http://127.0.0.1:8000/docs"
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
