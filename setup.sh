#!/bin/bash

# Ben's Road Service - Quick Setup Script
# Run with: ./setup.sh

echo "Setting up Ben's Road Service..."

# Create production directory
sudo mkdir -p /opt/bensroadservice/backend
sudo mkdir -p /opt/bensroadservice/frontend

# Copy files
sudo cp -r /root/roadservice/backend/* /opt/bensroadservice/backend/
sudo cp -r /root/roadservice/frontend/* /opt/bensroadservice/frontend/

# Setup backend
cd /opt/bensroadservice/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=bens_road_service
EOF
deactivate

# Setup frontend
cd /opt/bensroadservice/frontend
npm install --legacy-peer-deps
echo "REACT_APP_BACKEND_URL=https://bensroadservice247.com" > .env
npm run build

# Install serve globally
sudo npm install -g serve

# Create backend service
sudo tee /etc/systemd/system/bensroad-backend.service > /dev/null << 'EOF'
[Unit]
Description=Ben's Road Service Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/bensroadservice/backend
ExecStart=/opt/bensroadservice/backend/venv/bin/python3 -m uvicorn server:app --host 0.0.0.0 --port 8003
Restart=always
EnvironmentFile=/opt/bensroadservice/backend/.env

[Install]
WantedBy=multi-user.target
EOF

# Create frontend service
sudo tee /etc/systemd/system/bensroad-frontend.service > /dev/null << 'EOF'
[Unit]
Description=Ben's Road Service Frontend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/bensroadservice/frontend
ExecStart=/usr/bin/npx serve -s build -l 4001
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Create .htaccess
sudo tee /home/bensroaduni2/public_html/.htaccess > /dev/null << 'EOF'
RewriteEngine On

# Proxy API requests to backend (port 8003)
RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^api/(.*)$ http://127.0.0.1:8003/api/$1 [P,L]

# Proxy all other requests to frontend (port 4001)
RewriteCond %{REQUEST_URI} !^/api
RewriteRule ^(.*)$ http://127.0.0.1:4001/$1 [P,L]
EOF

# SELinux
sudo setsebool -P httpd_can_network_connect 1

# Start services
sudo systemctl daemon-reload
sudo systemctl enable bensroad-backend
sudo systemctl enable bensroad-frontend
sudo systemctl start bensroad-backend
sudo systemctl start bensroad-frontend

echo ""
echo "============================================"
echo "  DONE! Check status:"
echo "============================================"
sudo systemctl status bensroad-backend --no-pager
echo ""
sudo systemctl status bensroad-frontend --no-pager
echo ""
echo "Website: https://bensroadservice247.com"
echo "Admin: https://bensroadservice247.com/admin"
echo "============================================"
