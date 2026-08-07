@echo off
title BuildMyWebsiteAI Server Launcher
color 0A

echo ==================================================
echo       BuildMyWebsiteAI - Server Launcher
echo ==================================================
echo.
echo Starting Backend API Server (Port 8000)...
start "BuildMyWebsiteAI Backend API" cmd /k "cd /d %~dp0backend && python app/main.py"

echo Starting Frontend UI Web Server (Port 5173)...
start "BuildMyWebsiteAI Frontend UI" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ==================================================
echo [SUCCESS] Both Services Initialized!
echo.
echo  - Frontend Web App:  http://localhost:5173
echo  - Backend API:       http://localhost:8000
echo  - Super Admin Route: http://localhost:5173/admin
echo ==================================================
echo.
pause
