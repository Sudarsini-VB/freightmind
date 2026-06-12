@echo off
echo.
echo  ========================================
echo   FreightMind - Starting up...
echo  ========================================
echo.

where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERROR: Docker not found.
    echo  Please install Docker Desktop from https://docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo  Starting FreightMind with Docker...
docker-compose up --build -d

echo.
echo  ========================================
echo   FreightMind is running!
echo.
echo   Dashboard:  http://localhost:3000
echo   API:        http://localhost:8000
echo   API Docs:   http://localhost:8000/docs
echo.
echo   Login with:  demo / demo123
echo  ========================================
echo.
pause
