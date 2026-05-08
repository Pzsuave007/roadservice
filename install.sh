#!/bin/bash

echo "=========================================="
echo "  Installing Ben's Road Service Updates"
echo "=========================================="

cd ~/roadservice

# Create uploads folder for vehicle photos
echo "[1/4] Creating uploads folder..."
mkdir -p ~/roadservice/backend/uploads

# Extract frontend
echo "[2/4] Extracting frontend..."
tar -xzf frontend-build.tar.gz

# Copy to both possible locations
echo "[3/4] Copying files..."
cp -r build/* /home/bensroaduni2/ 2>/dev/null && echo "  ✓ Copied to /home/bensroaduni2/"
cp -r build/* /opt/bensroadservice/frontend/public/ 2>/dev/null && echo "  ✓ Copied to /opt/bensroadservice/frontend/public/"

# Restart backend
echo "[4/4] Restarting backend..."
sudo systemctl restart bensroad-backend
sleep 3

# Test
echo ""
echo "Testing..."
RESPONSE=$(curl -s http://localhost:8010/api/)
echo "Backend: $RESPONSE"

echo ""
echo "=========================================="
echo "  Done! Visit: https://bensroadservice247.com"
echo "=========================================="
