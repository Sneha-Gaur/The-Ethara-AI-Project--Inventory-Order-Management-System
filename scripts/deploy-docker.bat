@echo off
setlocal
cd /d "%~dp0.."

if "%DOCKER_USER%"=="" (
  echo Set your Docker Hub username first:
  echo   set DOCKER_USER=your-dockerhub-username
  exit /b 1
)

where docker >nul 2>&1
if errorlevel 1 (
  echo Install Docker Desktop: https://www.docker.com/products/docker-desktop/
  exit /b 1
)

echo Building image...
docker build -f docker/Dockerfile.backend -t %DOCKER_USER%/inventory-backend:latest .
if errorlevel 1 exit /b 1

echo Pushing to Docker Hub...
docker push %DOCKER_USER%/inventory-backend:latest
if errorlevel 1 (
  echo Run: docker login
  exit /b 1
)

echo.
echo Published: https://hub.docker.com/r/%DOCKER_USER%/inventory-backend
endlocal
