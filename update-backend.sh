#!/bin/bash

echo "=========================================="
echo "  Updating Ben's Road Service Backend"
echo "=========================================="
echo ""

cd ~/bensroadservice || cd ~/roadservice || { echo "ERROR: Cannot find project folder"; exit 1; }

echo "[1/5] Pulling latest code..."
git pull origin main

echo ""
echo "[2/5] Installing Python dependencies..."
cd backend
pip install -r requirements.txt

echo ""
echo "[3/5] Restarting Backend Service..."
sudo systemctl restart bensroad-backend
sleep 3

echo ""
echo "[4/5] Testing Backend..."
RESPONSE=$(curl -s http://localhost:8001/api/ 2>/dev/null)
echo "Backend Response: $RESPONSE"

echo ""
echo "[5/5] Testing Quote API..."
ESTIMATE=$(curl -s -X POST "http://localhost:8001/api/quote/estimate?vehicle_type=sedan&service_type=emergency_towing&is_emergency=true&distance_miles=10" 2>/dev/null)
echo "Quote API: $ESTIMATE"

echo ""
echo "=========================================="
if [[ "$ESTIMATE" == *"total_estimate"* ]]; then
    echo "  SUCCESS! Backend is now working!"
else
    echo "  Check the output above for errors."
fi
echo "=========================================="
