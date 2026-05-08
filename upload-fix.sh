#!/bin/bash

echo "=========================================="
echo "  Diagnosing Photo Upload Issue"
echo "=========================================="

echo ""
echo "[1/4] Creating uploads folder..."
sudo mkdir -p /opt/bensroadservice/backend/uploads
sudo mkdir -p ~/roadservice/backend/uploads
sudo chmod 777 /opt/bensroadservice/backend/uploads
sudo chmod 777 ~/roadservice/backend/uploads

echo ""
echo "[2/4] Checking uploads folder..."
ls -la /opt/bensroadservice/backend/uploads/ 2>&1 || echo "Folder not found in /opt"
ls -la ~/roadservice/backend/uploads/ 2>&1 || echo "Folder not found in ~/roadservice"

echo ""
echo "[3/4] Testing upload endpoint..."
curl -X POST http://localhost:8010/api/upload/photo -F "file=@/etc/hosts" 2>&1

echo ""
echo "[4/4] Backend logs..."
sudo journalctl -u bensroad-backend -n 20 --no-pager

echo ""
echo "=========================================="
echo "  Done!"
echo "=========================================="
