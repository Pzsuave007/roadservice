#!/bin/bash

echo "=========================================="
echo "  Testing Photo Upload"
echo "=========================================="

echo ""
echo "[1/2] Testing via production URL..."
curl -X POST https://bensroadservice247.com/api/upload/photo -F "file=@/etc/hosts"

echo ""
echo ""
echo "[2/2] Testing via localhost..."
curl -X POST http://localhost:8010/api/upload/photo -F "file=@/etc/hosts"

echo ""
echo ""
echo "=========================================="
echo "  Done!"
echo "=========================================="
