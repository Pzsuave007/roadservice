#!/bin/bash

echo "=========================================="
echo "  Installing Ben's Road Service Updates"
echo "=========================================="

cd ~/roadservice

# Create uploads folder for vehicle photos
echo "[1/4] Creating uploads folder..."
mkdir -p ~/roadservice/backend/uploads

# Extract frontend to web root
echo "[2/4] Extracting frontend..."
tar -xzf frontend-build.tar.gz
cp -r build/* /home/bensroaduni2/

# Restart backend
echo "[3/4] Restarting backend..."
sudo systemctl restart bensroad-backend
sleep 3

# Test
echo "[4/4] Testing..."
RESPONSE=$(curl -s http://localhost:8010/api/)
echo "Backend: $RESPONSE"

echo ""
echo "=========================================="
echo "  Done! Visit: https://bensroadservice247.com"
echo "=========================================="
