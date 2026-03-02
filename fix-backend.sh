#!/bin/bash

echo "=========================================="
echo "  Ben's Road Service - Backend Fix Script"
echo "=========================================="
echo ""

# Check MongoDB
echo "[1/4] Checking MongoDB..."
sudo systemctl start mongod 2>/dev/null
sudo systemctl enable mongod 2>/dev/null
echo "MongoDB: OK"

# Check backend service
echo ""
echo "[2/4] Restarting Backend Service..."
sudo systemctl restart bensroad-backend
sleep 3

# Test if backend is responding
echo ""
echo "[3/4] Testing Backend..."
RESPONSE=$(curl -s http://localhost:8001/api/ 2>/dev/null)
if [ -z "$RESPONSE" ]; then
    echo "Backend NOT responding. Checking logs..."
    echo ""
    echo "=== BACKEND LOGS ==="
    sudo journalctl -u bensroad-backend -n 30 --no-pager
    echo ""
    echo "ERROR: Backend is not working. Share the logs above."
else
    echo "Backend Response: $RESPONSE"
    echo "Backend: OK"
fi

# Test estimate endpoint
echo ""
echo "[4/4] Testing Quote Estimate API..."
ESTIMATE=$(curl -s -X POST "http://localhost:8001/api/quote/estimate?vehicle_type=sedan&service_type=emergency_towing&is_emergency=true&distance_miles=10" 2>/dev/null)
if [ -z "$ESTIMATE" ]; then
    echo "Quote API: NOT WORKING"
else
    echo "Quote API Response: $ESTIMATE"
    echo "Quote API: OK"
fi

echo ""
echo "=========================================="
echo "  Done! If you see errors above, share them."
echo "=========================================="
