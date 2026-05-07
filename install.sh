#!/bin/bash

echo "Installing Ben's Road Service updates..."

cd /root/roadservice

# Create uploads folder for vehicle photos
mkdir -p /root/roadservice/backend/uploads

# Extract the pre-built frontend
tar -xzvf frontend-build.tar.gz -C /opt/bensroadservice/frontend/

# Restart services
sudo systemctl restart bensroad-frontend
sudo systemctl restart bensroad-backend

sleep 3

# Test
echo ""
echo "Testing..."
echo "Frontend: $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4001)"
echo "Backend: $(curl -s http://localhost:8010/api/)"
echo ""
echo "Done! Visit: https://bensroadservice247.com"
