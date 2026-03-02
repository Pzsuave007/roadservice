#!/bin/bash

# ============================================
# Ben's Road Service LLC - Deployment Script
# One command to install and run everything!
# ============================================

set -e

echo "============================================"
echo "  Ben's Road Service LLC - Auto Deployer"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. This is okay for servers."
fi

# Detect OS
OS="unknown"
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
fi

echo "Detected OS: $OS"
echo ""

# ============================================
# Step 1: Install System Dependencies
# ============================================
echo "Step 1: Installing system dependencies..."

if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    sudo apt-get update
    sudo apt-get install -y curl git nodejs npm python3 python3-pip python3-venv nginx
    
    # Install Node.js 18+ if needed
    if ! command -v node &> /dev/null || [ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ] || [ "$OS" = "fedora" ] || [ "$OS" = "almalinux" ] || [ "$OS" = "rocky" ]; then
    sudo dnf install -y curl git python3 python3-pip nginx
    
    # Install Node.js 18 on RHEL-based systems
    if ! command -v node &> /dev/null; then
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo dnf install -y nodejs
    fi
    
elif [ "$OS" = "arch" ]; then
    sudo pacman -Sy --noconfirm curl git nodejs npm python python-pip nginx

elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if ! command -v brew &> /dev/null; then
        print_error "Please install Homebrew first: https://brew.sh"
        exit 1
    fi
    brew install node python3 nginx
else
    print_warning "Unknown OS. Please ensure Node.js 18+, Python 3.9+, and pip are installed."
fi

print_status "System dependencies installed"

# ============================================
# Step 2: Install MongoDB
# ============================================
echo ""
echo "Step 2: Setting up MongoDB..."

# Check if MongoDB is already installed
if command -v mongod &> /dev/null; then
    print_status "MongoDB already installed"
else
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        # Import MongoDB GPG key and add repository
        curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
        echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
        sudo apt-get update
        sudo apt-get install -y mongodb-org
        sudo systemctl start mongod
        sudo systemctl enable mongod
    else
        print_warning "Please install MongoDB manually or use MongoDB Atlas (cloud)"
        print_warning "MongoDB Atlas: https://www.mongodb.com/cloud/atlas"
        echo ""
        read -p "Enter your MongoDB connection string (or press Enter to use localhost): " MONGO_URL
        if [ -z "$MONGO_URL" ]; then
            MONGO_URL="mongodb://localhost:27017"
        fi
    fi
fi

print_status "MongoDB setup complete"

# ============================================
# Step 3: Setup Backend
# ============================================
echo ""
echo "Step 3: Setting up Backend..."

cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if not exists
if [ ! -f .env ]; then
    echo "Creating backend .env file..."
    cat > .env << EOF
MONGO_URL=${MONGO_URL:-mongodb://localhost:27017}
DB_NAME=bens_road_service
EOF
fi

print_status "Backend setup complete"

cd ..

# ============================================
# Step 4: Setup Frontend
# ============================================
echo ""
echo "Step 4: Setting up Frontend..."

cd frontend

# Install Node dependencies
npm install --legacy-peer-deps

# Get server IP/domain for frontend config
echo ""
read -p "Enter your server domain or IP (e.g., bensroadservice.com or 123.45.67.89): " SERVER_DOMAIN

if [ -z "$SERVER_DOMAIN" ]; then
    SERVER_DOMAIN="localhost"
fi

# Create .env file
cat > .env << EOF
REACT_APP_BACKEND_URL=https://${SERVER_DOMAIN}
EOF

# Build the frontend for production
npm run build

print_status "Frontend setup complete"

cd ..

# ============================================
# Step 5: Create Systemd Services
# ============================================
echo ""
echo "Step 5: Creating system services..."

# Create backend service
sudo cat > /etc/systemd/system/bens-backend.service << EOF
[Unit]
Description=Ben's Road Service Backend
After=network.target mongod.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)/backend
Environment=PATH=$(pwd)/backend/venv/bin
ExecStart=$(pwd)/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

print_status "Backend service created"

# ============================================
# Step 6: Configure Nginx
# ============================================
echo ""
echo "Step 6: Configuring Nginx..."

sudo cat > /etc/nginx/sites-available/bens-road-service << EOF
server {
    listen 80;
    server_name ${SERVER_DOMAIN};

    # Frontend - React build files
    location / {
        root $(pwd)/frontend/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/bens-road-service /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config
sudo nginx -t

print_status "Nginx configured"

# ============================================
# Step 7: Start Services
# ============================================
echo ""
echo "Step 7: Starting services..."

sudo systemctl daemon-reload
sudo systemctl enable bens-backend
sudo systemctl start bens-backend
sudo systemctl restart nginx

print_status "All services started"

# ============================================
# Step 8: Setup SSL (Optional)
# ============================================
echo ""
echo "Step 8: SSL Certificate (Optional but Recommended)"
read -p "Do you want to setup free SSL with Let's Encrypt? (y/n): " setup_ssl

if [ "$setup_ssl" = "y" ] || [ "$setup_ssl" = "Y" ]; then
    sudo apt-get install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d ${SERVER_DOMAIN}
    print_status "SSL certificate installed"
fi

# ============================================
# Done!
# ============================================
echo ""
echo "============================================"
echo -e "${GREEN}  DEPLOYMENT COMPLETE! ${NC}"
echo "============================================"
echo ""
echo "Your website is now running at:"
echo -e "  ${GREEN}http://${SERVER_DOMAIN}${NC}"
if [ "$setup_ssl" = "y" ]; then
    echo -e "  ${GREEN}https://${SERVER_DOMAIN}${NC}"
fi
echo ""
echo "Admin Dashboard:"
echo -e "  ${GREEN}http://${SERVER_DOMAIN}/admin${NC}"
echo "  Username: admin"
echo "  Password: bensroadservice2024"
echo ""
echo "Useful commands:"
echo "  - Check backend status: sudo systemctl status bens-backend"
echo "  - View backend logs: sudo journalctl -u bens-backend -f"
echo "  - Restart backend: sudo systemctl restart bens-backend"
echo "  - Restart nginx: sudo systemctl restart nginx"
echo ""
echo "============================================"
