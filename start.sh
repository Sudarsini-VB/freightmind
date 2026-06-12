#!/bin/bash
echo ""
echo "========================================"
echo "  FreightMind - Starting up..."
echo "========================================"
echo ""

if ! command -v docker &> /dev/null; then
    echo " ERROR: Docker not found."
    echo " Install from: https://docker.com/products/docker-desktop"
    exit 1
fi

echo " Starting FreightMind..."
docker-compose up --build -d

echo ""
echo "========================================"
echo "  FreightMind is running!"
echo ""
echo "  Dashboard:  http://localhost:3000"
echo "  API:        http://localhost:8000"
echo "  API Docs:   http://localhost:8000/docs"
echo ""
echo "  Login:  demo / demo123"
echo "========================================"
echo ""
