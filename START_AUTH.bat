@echo off
title Inventory - Start API + Frontend (SQLite)
cd /d "%~dp0"

echo Installing API server + SQLite database...
cd server
if not exist node_modules call npm install
call npm run init-db
echo.
echo Starting API on http://127.0.0.1:8000  (database: backend\inventory.db)
start "Inventory API" cmd /k "cd /d %~dp0server && npm start"

cd /d "%~dp0frontend"
if not exist node_modules call npm install
echo Starting frontend on http://localhost:5173
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 >nul
echo.
echo ==========================================
echo   Open: http://localhost:5173/signup
echo   Use ANY username, email, password (6+ chars)
echo ==========================================
pause
