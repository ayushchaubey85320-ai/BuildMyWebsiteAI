#!/bin/bash

echo "=================================================="
echo "      BuildMyWebsiteAI - Server Launcher"
echo "=================================================="
echo ""

echo "Starting Backend API Server (Port 8000)..."
cd "$(dirname "$0")/backend" && python app/main.py &
BACKEND_PID=$!

echo "Starting Frontend UI Web Server (Port 5173)..."
cd "$(dirname "$0")/frontend" && npm run dev &
FRONTEND_PID=$!

echo ""
echo "=================================================="
echo "[SUCCESS] Both Services Initialized!"
echo ""
echo " - Frontend Web App:  http://localhost:5173"
echo " - Backend API:       http://localhost:8000"
echo " - Super Admin Route: http://localhost:5173/admin"
echo "=================================================="
echo ""
wait $BACKEND_PID $FRONTEND_PID
