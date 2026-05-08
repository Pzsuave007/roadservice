#!/bin/bash

echo "=========================================="
echo "  Updating Ben's Road Service"
echo "=========================================="

cd ~/roadservice

# Create uploads folder for vehicle photos
echo "[1/5] Creating uploads folder..."
mkdir -p ~/roadservice/backend/uploads

# Extract frontend build
echo "[2/5] Extracting frontend..."
tar -xzf frontend-build.tar.gz

# Copy to production frontend folder
echo "[3/5] Copying to production..."
sudo cp -r build/* /opt/bensroadservice/frontend/build/

# Update backend files
echo "[4/5] Updating backend..."
sudo cp backend/server.py /opt/bensroadservice/backend/server.py

# Restart services
echo "[5/5] Restarting services..."
sudo systemctl restart bensroad-backend
sudo systemctl restart bensroad-frontend
sleep 3

# Test
echo ""
echo "Testing..."
echo "Backend: $(curl -s http://localhost:8010/api/)"
echo "Frontend: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:4001)"

echo ""
echo "=========================================="
echo "  Done! Visit: https://bensroadservice247.com"
echo "=========================================="
