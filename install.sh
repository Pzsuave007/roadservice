#!/bin/bash

echo "Installing pre-built frontend..."

cd /root/roadservice

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
echo "Backend: $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8003/api/health)"
echo ""
echo "Done! Visit: https://bensroadservice247.com"
