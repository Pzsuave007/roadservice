#!/bin/bash

# ============================================
# Ben's Road Service LLC - Deployment Script
# For GoDaddy VPS (AlmaLinux 9 + cPanel + Apache)
# ============================================

set -e

echo "============================================"
echo "  Ben's Road Service LLC - Auto Deployer"
echo "  (AlmaLinux + cPanel + Apache)"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Working directory: $SCRIPT_DIR"
echo ""

# ============================================
# Step 1: Check Requirements
# ============================================
echo "Step 1: Checking requirements..."

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_status "Python found: $PYTHON_VERSION"
else
    print_error "Python3 not found. Please install Python 3.9+"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js found: $NODE_VERSION"
else
    print_warning "Node.js not found. Installing..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo dnf install -y nodejs
fi

# Check if Apache is running
if systemctl is-active --quiet httpd; then
    print_status "Apache is running"
else
    print_warning "Apache not running, attempting to start..."
    sudo systemctl start httpd
fi

# ============================================
# Step 2: Get Domain Configuration
# ============================================
echo ""
echo "Step 2: Domain Configuration..."

read -p "Enter your domain (e.g., bensroadservice.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    DOMAIN="localhost"
fi

read -p "Enter your document root path (e.g., /home/username/public_html): " DOC_ROOT
if [ -z "$DOC_ROOT" ]; then
    DOC_ROOT="/var/www/html"
fi

print_status "Domain: $DOMAIN"
print_status "Document Root: $DOC_ROOT"

# ============================================
# Step 3: Setup Backend
# ============================================
echo ""
echo "Step 3: Setting up Backend..."

cd "$SCRIPT_DIR/backend"

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
read -p "Enter MongoDB connection string (press Enter for localhost): " MONGO_URL
if [ -z "$MONGO_URL" ]; then
    MONGO_URL="mongodb://localhost:27017"
fi

cat > .env << EOF
MONGO_URL=$MONGO_URL
DB_NAME=bens_road_service
EOF

print_status "Backend dependencies installed"

cd "$SCRIPT_DIR"

# ============================================
# Step 4: Setup Frontend
# ============================================
echo ""
echo "Step 4: Setting up Frontend..."

cd "$SCRIPT_DIR/frontend"

# Install Node dependencies
npm install --legacy-peer-deps

# Create .env file for production
cat > .env << EOF
REACT_APP_BACKEND_URL=https://${DOMAIN}
EOF

# Build the frontend for production
echo "Building frontend (this may take a few minutes)..."
npm run build

print_status "Frontend built successfully"

cd "$SCRIPT_DIR"

# ============================================
# Step 5: Deploy Frontend to Document Root
# ============================================
echo ""
echo "Step 5: Deploying frontend files..."

# Copy built files to document root
if [ -d "$DOC_ROOT" ]; then
    # Backup existing files
    if [ "$(ls -A $DOC_ROOT)" ]; then
        sudo mv "$DOC_ROOT" "${DOC_ROOT}_backup_$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
        sudo mkdir -p "$DOC_ROOT"
    fi
    
    sudo cp -r "$SCRIPT_DIR/frontend/build/"* "$DOC_ROOT/"
    sudo chown -R apache:apache "$DOC_ROOT" 2>/dev/null || sudo chown -R www-data:www-data "$DOC_ROOT" 2>/dev/null || true
    print_status "Frontend files deployed to $DOC_ROOT"
else
    print_error "Document root $DOC_ROOT does not exist"
    exit 1
fi

# ============================================
# Step 6: Create Backend Service
# ============================================
echo ""
echo "Step 6: Creating backend service..."

# Create systemd service for backend
sudo tee /etc/systemd/system/bens-backend.service > /dev/null << EOF
[Unit]
Description=Ben's Road Service Backend API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$SCRIPT_DIR/backend
Environment="PATH=$SCRIPT_DIR/backend/venv/bin"
ExecStart=$SCRIPT_DIR/backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start service
sudo systemctl daemon-reload
sudo systemctl enable bens-backend
sudo systemctl start bens-backend

print_status "Backend service created and started"

# ============================================
# Step 7: Configure Apache
# ============================================
echo ""
echo "Step 7: Configuring Apache..."

# Enable required Apache modules
sudo dnf install -y mod_ssl 2>/dev/null || true

# Check if proxy modules are available
if ! httpd -M 2>/dev/null | grep -q proxy_module; then
    print_warning "Enabling Apache proxy modules..."
fi

# Create .htaccess for API routing
sudo tee "$DOC_ROOT/.htaccess" > /dev/null << 'EOF'
RewriteEngine On

# Handle React Router (SPA)
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api
RewriteRule . /index.html [L]

# Proxy API requests to backend
RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^api/(.*)$ http://127.0.0.1:8001/api/$1 [P,L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options SAMEORIGIN
Header always set X-XSS-Protection "1; mode=block"
EOF

# Create Apache config for the virtual host (if not using cPanel)
APACHE_CONF="/etc/httpd/conf.d/bens-road-service.conf"
sudo tee "$APACHE_CONF" > /dev/null << EOF
# Ben's Road Service LLC - Apache Configuration

# Enable proxy modules
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so

<VirtualHost *:80>
    ServerName $DOMAIN
    ServerAlias www.$DOMAIN
    DocumentRoot $DOC_ROOT
    
    <Directory $DOC_ROOT>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Proxy API requests to FastAPI backend
    ProxyPreserveHost On
    ProxyPass /api/ http://127.0.0.1:8001/api/
    ProxyPassReverse /api/ http://127.0.0.1:8001/api/
    
    # Logging
    ErrorLog logs/${DOMAIN}-error.log
    CustomLog logs/${DOMAIN}-access.log combined
</VirtualHost>
EOF

# Test Apache config
if sudo httpd -t 2>&1 | grep -q "Syntax OK"; then
    print_status "Apache configuration is valid"
    sudo systemctl restart httpd
else
    print_warning "Apache config test failed. You may need to configure manually in cPanel."
fi

print_status "Apache configured"

# ============================================
# Step 8: SELinux Configuration (AlmaLinux)
# ============================================
echo ""
echo "Step 8: Configuring SELinux..."

# Allow Apache to connect to network (for proxy)
sudo setsebool -P httpd_can_network_connect 1 2>/dev/null || true
print_status "SELinux configured for Apache proxy"

# ============================================
# Step 9: Firewall Configuration
# ============================================
echo ""
echo "Step 9: Configuring Firewall..."

# Open HTTP and HTTPS ports
sudo firewall-cmd --permanent --add-service=http 2>/dev/null || true
sudo firewall-cmd --permanent --add-service=https 2>/dev/null || true
sudo firewall-cmd --reload 2>/dev/null || true
print_status "Firewall configured"

# ============================================
# Done!
# ============================================
echo ""
echo "============================================"
echo -e "${GREEN}  DEPLOYMENT COMPLETE! ${NC}"
echo "============================================"
echo ""
echo "Your website is now running at:"
echo -e "  ${GREEN}http://${DOMAIN}${NC}"
echo ""
echo "Admin Dashboard:"
echo -e "  ${GREEN}http://${DOMAIN}/admin${NC}"
echo "  Username: admin"
echo "  Password: bensroadservice2024"
echo ""
echo "============================================"
echo "  IMPORTANT FOR cPANEL USERS"
echo "============================================"
echo ""
echo "If API calls don't work, add this to your"
echo "cPanel Apache Configuration or .htaccess:"
echo ""
echo "  ProxyPass /api/ http://127.0.0.1:8001/api/"
echo "  ProxyPassReverse /api/ http://127.0.0.1:8001/api/"
echo ""
echo "============================================"
echo ""
echo "Useful commands:"
echo "  - Check backend: sudo systemctl status bens-backend"
echo "  - View logs: sudo journalctl -u bens-backend -f"
echo "  - Restart backend: sudo systemctl restart bens-backend"
echo "  - Restart Apache: sudo systemctl restart httpd"
echo ""
echo "============================================"
