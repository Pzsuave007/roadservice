#!/bin/bash

# Ben's Road Service - Fix Script
echo "Fixing Ben's Road Service..."

# Stop services first
sudo systemctl stop bensroad-backend
sudo systemctl stop bensroad-frontend

# Fix Frontend - Build it properly
echo ""
echo "Building frontend..."
cd /opt/bensroadservice/frontend

# Make sure .env exists
echo "REACT_APP_BACKEND_URL=https://bensroadservice247.com" > .env

# Install dependencies and build
npm install --legacy-peer-deps
npm run build

# Check if build succeeded
if [ -d "build" ]; then
    echo "✓ Frontend build successful!"
    ls -la build/
else
    echo "✗ Frontend build FAILED"
    exit 1
fi

# Fix Backend - Check for errors
echo ""
echo "Testing backend..."
cd /opt/bensroadservice/backend
source venv/bin/activate

# Test if server.py can be imported
python3 -c "import server" 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Backend code OK"
else
    echo "✗ Backend has import errors. Checking..."
    python3 -c "import server" 2>&1
fi

deactivate

# Restart services
echo ""
echo "Starting services..."
sudo systemctl start bensroad-backend
sudo systemctl start bensroad-frontend

# Wait a moment
sleep 3

# Check status
echo ""
echo "============================================"
echo "Service Status:"
echo "============================================"
sudo systemctl status bensroad-backend --no-pager -l
echo ""
sudo systemctl status bensroad-frontend --no-pager -l

# Test connections
echo ""
echo "============================================"
echo "Testing connections:"
echo "============================================"
echo "Frontend (4001):"
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4001
echo ""
echo "Backend (8003):"
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8003/api/health
echo ""
echo "============================================"
