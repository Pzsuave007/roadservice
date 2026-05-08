#!/bin/bash

echo "=========================================="
echo "  Fixing Apache Proxy"
echo "=========================================="

echo "[1/5] Checking Apache modules..."
httpd -M 2>/dev/null | grep proxy || apache2ctl -M 2>/dev/null | grep proxy || echo "Cannot check modules"

echo ""
echo "[2/5] Enabling proxy modules..."
sudo a2enmod proxy proxy_http 2>/dev/null || echo "a2enmod not found, trying httpd config..."

# For CentOS/AlmaLinux, check if proxy module is loaded
if [ -f /etc/httpd/conf/httpd.conf ]; then
    echo "Found httpd.conf"
    # Check if proxy module lines exist
    grep -q "mod_proxy" /etc/httpd/conf/httpd.conf && echo "proxy module configured" || echo "proxy module NOT configured"
fi

echo ""
echo "[3/5] Checking .htaccess location..."
ls -la /home/bensroaduni2/.htaccess 2>/dev/null || echo ".htaccess not found in /home/bensroaduni2/"

echo ""
echo "[4/5] Checking Apache config for AllowOverride..."
grep -r "AllowOverride" /etc/httpd/ 2>/dev/null | head -5
grep -r "AllowOverride" /etc/apache2/ 2>/dev/null | head -5

echo ""
echo "[5/5] Restarting Apache..."
sudo systemctl restart httpd 2>/dev/null || sudo systemctl restart apache2 2>/dev/null || echo "Could not restart Apache"

echo ""
echo "Testing API again..."
curl -s https://bensroadservice247.com/api/ | head -c 200

echo ""
echo ""
echo "=========================================="
echo "  Done! Check output above for issues"
echo "=========================================="
