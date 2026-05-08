#!/bin/bash

echo "=========================================="
echo "  Fixing Apache Proxy Configuration"
echo "=========================================="

# Find the web root
WEBROOT="/home/bensroaduni2"

echo "[1/3] Creating .htaccess..."
cat > $WEBROOT/.htaccess << 'EOF'
RewriteEngine On

# Proxy API requests to backend (port 8010)
RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^api/(.*)$ http://127.0.0.1:8010/api/$1 [P,L]

# Handle React Router - serve index.html for all non-file requests
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
EOF

echo "[2/3] Setting permissions..."
chmod 644 $WEBROOT/.htaccess

echo "[3/3] Testing..."
echo ""
echo "Testing API via production URL:"
curl -s -X POST https://bensroadservice247.com/api/upload/photo -F "file=@/etc/hosts"

echo ""
echo ""
echo "=========================================="
echo "  Done!"
echo "=========================================="
