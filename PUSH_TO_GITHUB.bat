@echo off
title Push to GitHub
cd /d "%~dp0"

where git >nul 2>&1
if errorlevel 1 (
  echo Git is not installed. Install from https://git-scm.com/download/win
  pause
  exit /b 1
)

echo Initializing repository...
if not exist .git git init
git branch -M main 2>nul

git remote remove origin 2>nul
git remote add origin https://github.com/Sneha-Gaur/The-Ethara-AI-Project--Inventory-Order-Management-System.git

echo.
echo Staging files...
git add .

echo.
echo Committing...
git commit -m "Complete Inventory & Order Management System"
if errorlevel 1 (
  echo Nothing to commit or commit failed. Check git status.
  git status
  pause
  exit /b 1
)

echo.
echo Ready to push. Run:
echo   git push -u origin main
echo.
echo If remote has existing files, run first:
echo   git pull origin main --rebase
echo.
pause
