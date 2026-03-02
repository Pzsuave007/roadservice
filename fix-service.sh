#!/bin/bash

echo "=========================================="
echo "  Fixing Backend Service Configuration"
echo "=========================================="
echo ""

# Create the correct systemd service file
echo "[1/4] Creating correct service configuration..."
sudo cat > /etc/systemd/system/bensroad-backend.service << 'EOF'
[Unit]
Description=Bens Road Service Backend
After=network.target mongod.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/roadservice/backend
ExecStart=/usr/local/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=3
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF

echo "Service file created."

echo ""
echo "[2/4] Reloading systemd..."
sudo systemctl daemon-reload

echo ""
echo "[3/4] Restarting backend service..."
sudo systemctl restart bensroad-backend
sleep 3

echo ""
echo "[4/4] Testing..."
RESPONSE=$(curl -s http://localhost:8001/api/ 2>/dev/null)
echo "Backend Response: $RESPONSE"

ESTIMATE=$(curl -s -X POST "http://localhost:8001/api/quote/estimate?vehicle_type=sedan&service_type=emergency_towing&is_emergency=true&distance_miles=10" 2>/dev/null)
echo "Quote API: $ESTIMATE"

echo ""
echo "=========================================="
if [[ "$RESPONSE" == *"Ben"* ]]; then
    echo "  SUCCESS! Backend is now working!"
else
    echo "  Checking logs for errors..."
    sudo journalctl -u bensroad-backend -n 20 --no-pager
fi
echo "=========================================="
