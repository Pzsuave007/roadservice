#!/bin/bash

echo "Fixing frontend build..."

cd /opt/bensroadservice/frontend

echo "Removing old node_modules..."
rm -rf node_modules package-lock.json

echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Installing ajv fix..."
npm install ajv@8 ajv-keywords@5 --legacy-peer-deps

echo "Building..."
npm run build

if [ -d "build" ]; then
    echo ""
    echo "✓ BUILD SUCCESSFUL!"
    echo ""
    echo "Restarting services..."
    sudo systemctl restart bensroad-frontend
    sudo systemctl restart bensroad-backend
    sleep 3
    echo ""
    echo "Testing..."
    curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://127.0.0.1:4001
    curl -s -o /dev/null -w "Backend: %{http_code}\n" http://127.0.0.1:8003/api/health
    echo ""
    echo "Done! Visit: https://bensroadservice247.com"
else
    echo "✗ Build failed"
fi
