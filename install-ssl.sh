#!/bin/bash

echo "=========================================="
echo "  Installing SSL Certificate"
echo "  Domain: bensroadservice247.com"
echo "=========================================="
echo ""

# Install certbot if not installed
echo "[1/4] Installing Certbot..."
sudo dnf install -y certbot python3-certbot-apache 2>/dev/null || sudo yum install -y certbot python3-certbot-apache 2>/dev/null || sudo apt install -y certbot python3-certbot-apache 2>/dev/null

# Stop Apache temporarily
echo ""
echo "[2/4] Configuring SSL..."

# Get the certificate
echo ""
echo "[3/4] Getting SSL Certificate from Let's Encrypt..."
sudo certbot --apache -d bensroadservice247.com -d www.bensroadservice247.com --non-interactive --agree-tos --email admin@bensroadservice247.com --redirect

# Check status
echo ""
echo "[4/4] Verifying..."
if sudo certbot certificates | grep -q "bensroadservice247.com"; then
    echo ""
    echo "=========================================="
    echo "  SUCCESS! SSL Certificate Installed!"
    echo "  Your site is now secure: https://bensroadservice247.com"
    echo "=========================================="
else
    echo ""
    echo "=========================================="
    echo "  Certificate may need manual setup."
    echo "  Try: sudo certbot --apache"
    echo "=========================================="
fi
