#!/bin/bash

echo "=========================================="
echo "  Finding and Fixing API Proxy"
echo "=========================================="

echo "[1/6] Finding virtual host config..."
grep -r "bensroad" /etc/apache2/ 2>/dev/null | head -10
grep -r "bensroad" /etc/httpd/ 2>/dev/null | head -10
grep -r "bensroaduni2" /var/cpanel/ 2>/dev/null | head -5

echo ""
echo "[2/6] Checking current .htaccess..."
cat /home/bensroaduni2/.htaccess

echo ""
echo "[3/6] Trying different .htaccess syntax..."
cat > /home/bensroaduni2/.htaccess << 'EOF'
RewriteEngine On

# Proxy API requests to backend
<IfModule mod_proxy.c>
    ProxyPass /api http://127.0.0.1:8010/api
    ProxyPassReverse /api http://127.0.0.1:8010/api
</IfModule>

# If proxy doesn't work, try rewrite
RewriteCond %{REQUEST_URI} ^/api(.*)$
RewriteRule ^api/(.*)$ http://127.0.0.1:8010/api/$1 [P,L]

# Handle React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
EOF

echo ""
echo "[4/6] Checking if there's a separate vhost config..."
ls -la /home/bensroaduni2/*.conf 2>/dev/null
ls -la /etc/apache2/conf.d/vhosts/ 2>/dev/null

echo ""
echo "[5/6] Restarting Apache..."
sudo systemctl restart apache2 2>/dev/null || sudo systemctl restart httpd 2>/dev/null

echo ""
echo "[6/6] Testing..."
sleep 2
curl -s https://bensroadservice247.com/api/ | head -c 100

echo ""
echo ""
echo "=========================================="
echo "  If still not working, check cPanel settings"
echo "=========================================="
