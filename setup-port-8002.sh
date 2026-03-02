#!/bin/bash

echo "=========================================="
echo "  Configuring Ben's Road Service - Port 8002"
echo "=========================================="
echo ""

cd ~/roadservice || { echo "ERROR: Cannot find roadservice folder"; exit 1; }

# 1. Update systemd service with new port
echo "[1/5] Creating backend service on port 8002..."
sudo cat > /etc/systemd/system/bensroad-backend.service << 'EOF'
[Unit]
Description=Bens Road Service Backend
After=network.target mongod.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/roadservice/backend
ExecStart=/usr/local/bin/uvicorn server:app --host 0.0.0.0 --port 8002
Restart=always
RestartSec=3
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF

# 2. Update .htaccess to proxy to port 8002
echo "[2/5] Updating .htaccess for port 8002..."
cat > ~/roadservice/.htaccess << 'EOF'
RewriteEngine On

# Proxy API requests to backend on port 8002
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:8002/api/$1 [P,L]

# Serve static files
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
EOF

# 3. Copy .htaccess to public_html
echo "[3/5] Copying to public_html..."
cp ~/roadservice/.htaccess ~/public_html/.htaccess 2>/dev/null || true

# 4. Reload and restart
echo "[4/5] Restarting services..."
sudo systemctl daemon-reload
sudo systemctl restart bensroad-backend
sleep 3

# 5. Test
echo "[5/5] Testing backend on port 8002..."
RESPONSE=$(curl -s http://localhost:8002/api/ 2>/dev/null)
echo "Backend Response: $RESPONSE"

ESTIMATE=$(curl -s -X POST "http://localhost:8002/api/quote/estimate?vehicle_type=sedan&service_type=emergency_towing&is_emergency=true&distance_miles=10" 2>/dev/null)
echo "Quote API: $ESTIMATE"

echo ""
echo "=========================================="
if [[ "$RESPONSE" == *"Ben"* ]]; then
    echo "  SUCCESS! Ben's Road Service running on port 8002"
else
    echo "  Checking logs..."
    sudo journalctl -u bensroad-backend -n 15 --no-pager
fi
echo "=========================================="
