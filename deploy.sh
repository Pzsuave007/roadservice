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

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[✓]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }

# Configuration
GIT_REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROD_DIR="/opt/bensroadservice"
BACKEND_PORT="8003"
FRONTEND_PORT="4001"

echo "Git Repository: $GIT_REPO_DIR"
echo "Production Dir: $PROD_DIR"
echo "Backend Port: $BACKEND_PORT"
echo "Frontend Port: $FRONTEND_PORT"
echo ""

# ============================================
# Step 1: Check Requirements
# ============================================
echo "Step 1: Checking requirements..."

# Check Python
if command -v python3 &> /dev/null; then
    print_status "Python found: $(python3 --version)"
else
    print_error "Python3 not found!"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    print_status "Node.js found: $(node --version)"
else
    print_warning "Installing Node.js..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo dnf install -y nodejs
fi

# Check/Install serve globally
if ! command -v serve &> /dev/null; then
    print_warning "Installing serve globally..."
    sudo npm install -g serve
fi
print_status "serve is installed"

# ============================================
# Step 2: Create Production Directory
# ============================================
echo ""
echo "Step 2: Creating production directory..."

sudo mkdir -p $PROD_DIR/backend
sudo mkdir -p $PROD_DIR/frontend

# Copy files to production
sudo cp -r $GIT_REPO_DIR/backend/* $PROD_DIR/backend/
sudo cp -r $GIT_REPO_DIR/frontend/* $PROD_DIR/frontend/

print_status "Files copied to $PROD_DIR"

# ============================================
# Step 3: Setup Backend
# ============================================
echo ""
echo "Step 3: Setting up Backend..."

cd $PROD_DIR/backend

# Create virtual environment if not exists
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate

# Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file (using localhost MongoDB)
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=bens_road_service
EOF

deactivate
print_status "Backend setup complete"

# ============================================
# Step 4: Setup Frontend
# ============================================
echo ""
echo "Step 4: Setting up Frontend..."

cd $PROD_DIR/frontend

# Get domain
read -p "Enter your domain (e.g., bensroadservice247.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    DOMAIN="localhost"
fi

# Create .env for React build
cat > .env << EOF
REACT_APP_BACKEND_URL=https://$DOMAIN
EOF

# Install dependencies
npm install --legacy-peer-deps

# Build the frontend
echo "Building frontend (this may take a few minutes)..."
npm run build

print_status "Frontend built successfully"

# ============================================
# Step 5: Create systemd Services
# ============================================
echo ""
echo "Step 5: Creating systemd services..."

# Backend Service
sudo tee /etc/systemd/system/bensroad-backend.service > /dev/null << EOF
[Unit]
Description=Ben's Road Service Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$PROD_DIR/backend
ExecStart=$PROD_DIR/backend/venv/bin/python3 -m uvicorn server:app --host 0.0.0.0 --port $BACKEND_PORT
Restart=always
EnvironmentFile=$PROD_DIR/backend/.env

[Install]
WantedBy=multi-user.target
EOF

print_status "Backend service created"

# Frontend Service
sudo tee /etc/systemd/system/bensroad-frontend.service > /dev/null << EOF
[Unit]
Description=Ben's Road Service Frontend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$PROD_DIR/frontend
ExecStart=/usr/bin/npx serve -s build -l $FRONTEND_PORT
Restart=always

[Install]
WantedBy=multi-user.target
EOF

print_status "Frontend service created"

# Reload and start services
sudo systemctl daemon-reload
sudo systemctl enable bensroad-backend
sudo systemctl enable bensroad-frontend
sudo systemctl restart bensroad-backend
sudo systemctl restart bensroad-frontend

print_status "Services started"

# ============================================
# Step 6: Configure SELinux
# ============================================
echo ""
echo "Step 6: Configuring SELinux..."

sudo setsebool -P httpd_can_network_connect 1 2>/dev/null || true
print_status "SELinux configured"

# ============================================
# Step 7: Create .htaccess for Apache
# ============================================
echo ""
echo "Step 7: Creating .htaccess..."

read -p "Enter your document root path (e.g., /home/bensroaduni2/public_html): " DOC_ROOT
if [ -z "$DOC_ROOT" ]; then
    DOC_ROOT="/home/bensroaduni2/public_html"
fi

# Create .htaccess
sudo tee $DOC_ROOT/.htaccess > /dev/null << EOF
RewriteEngine On

# Proxy API requests to backend (port $BACKEND_PORT)
RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^api/(.*)$ http://127.0.0.1:$BACKEND_PORT/api/\$1 [P,L]

# Proxy all other requests to frontend (port $FRONTEND_PORT)
RewriteCond %{REQUEST_URI} !^/api
RewriteRule ^(.*)$ http://127.0.0.1:$FRONTEND_PORT/\$1 [P,L]
EOF

print_status ".htaccess created at $DOC_ROOT"

# ============================================
# Step 8: Create Update Script
# ============================================
echo ""
echo "Step 8: Creating update script..."

cat > $GIT_REPO_DIR/update.sh << EOF
#!/bin/bash
cd $GIT_REPO_DIR
git fetch origin
git pull origin main
cp -r backend/* $PROD_DIR/backend/
cp -r frontend/* $PROD_DIR/frontend/
cd $PROD_DIR/frontend
npm install --legacy-peer-deps
npm run build
sudo systemctl restart bensroad-backend
sudo systemctl restart bensroad-frontend
echo "✓ Update complete!"
EOF

chmod +x $GIT_REPO_DIR/update.sh
print_status "Update script created: $GIT_REPO_DIR/update.sh"

# ============================================
# Done!
# ============================================
echo ""
echo "============================================"
echo -e "${GREEN}  DEPLOYMENT COMPLETE! ${NC}"
echo "============================================"
echo ""
echo "Your website should now be running at:"
echo -e "  ${GREEN}https://${DOMAIN}${NC}"
echo ""
echo "Admin Dashboard:"
echo -e "  ${GREEN}https://${DOMAIN}/admin${NC}"
echo "  Username: admin"
echo "  Password: bensroadservice2024"
echo ""
echo "============================================"
echo "  SERVICE COMMANDS"
echo "============================================"
echo ""
echo "Check status:"
echo "  sudo systemctl status bensroad-backend"
echo "  sudo systemctl status bensroad-frontend"
echo ""
echo "Restart services:"
echo "  sudo systemctl restart bensroad-backend"
echo "  sudo systemctl restart bensroad-frontend"
echo ""
echo "View logs:"
echo "  journalctl -u bensroad-backend -f"
echo "  journalctl -u bensroad-frontend -f"
echo ""
echo "Update from GitHub:"
echo "  cd $GIT_REPO_DIR && ./update.sh"
echo ""
echo "============================================"
echo "  PORTS USED"
echo "============================================"
echo "  Backend:  $BACKEND_PORT"
echo "  Frontend: $FRONTEND_PORT"
echo "============================================"
