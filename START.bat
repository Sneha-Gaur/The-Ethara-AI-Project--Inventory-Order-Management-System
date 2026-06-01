@echo off
title Inventory System Launcher
echo ============================================
echo  Inventory and Order Management System
echo ============================================
echo.

set PY=
for %%P in (
  "%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
  "%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
  "%ProgramFiles%\Python312\python.exe"
) do if exist %%P set PY=%%P

if "%PY%"=="" (
  echo ERROR: Python not found.
  echo Install from https://www.python.org/downloads/
  echo Check "Add python.exe to PATH" during install.
  pause
  exit /b 1
)

echo Using Python: %PY%
echo.

cd /d "%~dp0backend"
if not exist venv (
  echo Creating virtual environment...
  "%PY%" -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt -q

echo Initializing database...
python init_database.py
if errorlevel 1 (
  echo Database init failed.
  pause
  exit /b 1
)

echo.
echo Starting API on http://127.0.0.1:8000
start "Backend API" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate.bat && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

cd /d "%~dp0frontend"
if not exist node_modules call npm install
echo Starting frontend on http://localhost:5173
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ============================================
echo  Open: http://localhost:5173/signup
echo  API:  http://127.0.0.1:8000/health/db
echo ============================================
pause
