#!/bin/bash

echo "=========================================="
echo "  Installing SSL Certificate"
echo "  Domain: bensroadservice247.com"
echo "=========================================="
echo ""

# Enable EPEL repository first
echo "[1/5] Enabling EPEL repository..."
sudo dnf install -y epel-release

# Install snapd for certbot
echo ""
echo "[2/5] Installing snapd..."
sudo dnf install -y snapd
sudo systemctl enable --now snapd.socket
sudo ln -s /var/lib/snapd/snap /snap 2>/dev/null

# Wait for snapd to be ready
echo ""
echo "[3/5] Waiting for snapd..."
sleep 10

# Install certbot via snap
echo ""
echo "[4/5] Installing Certbot..."
sudo snap install core
sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot 2>/dev/null

# Get the certificate
echo ""
echo "[5/5] Getting SSL Certificate..."
sudo /snap/bin/certbot --apache -d bensroadservice247.com -d www.bensroadservice247.com --non-interactive --agree-tos --email admin@bensroadservice247.com --redirect

echo ""
echo "=========================================="
echo "  Done! Try visiting: https://bensroadservice247.com"
echo "=========================================="
