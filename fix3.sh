#!/bin/bash

echo "Fixing frontend with Node.js 18..."

# Install nvm if not present
if [ ! -d "$HOME/.nvm" ]; then
    echo "Installing nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
fi

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install and use Node 18
echo "Installing Node.js 18..."
nvm install 18
nvm use 18

echo "Node version: $(node -v)"

# Build frontend
cd /opt/bensroadservice/frontend

echo "Removing old build files..."
rm -rf node_modules package-lock.json build

echo "Creating .env..."
echo "REACT_APP_BACKEND_URL=https://bensroadservice247.com" > .env

echo "Installing dependencies..."
npm install --legacy-peer-deps

echo "Building..."
npm run build

if [ -d "build" ]; then
    echo ""
    echo "✓ BUILD SUCCESSFUL!"
    
    # Update frontend service to use node 18
    NODE18_PATH=$(which node)
    NPX18_PATH=$(which npx)
    
    echo "Updating frontend service to use Node 18..."
    sudo tee /etc/systemd/system/bensroad-frontend.service > /dev/null << EOF
[Unit]
Description=Ben's Road Service Frontend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/bensroadservice/frontend
ExecStart=$NPX18_PATH serve -s build -l 4001
Restart=always
Environment="PATH=$NVM_DIR/versions/node/v18.20.8/bin:/usr/bin:/bin"

[Install]
WantedBy=multi-user.target
EOF

    echo "Restarting services..."
    sudo systemctl daemon-reload
    sudo systemctl restart bensroad-frontend
    sudo systemctl restart bensroad-backend
    sleep 3
    
    echo ""
    echo "Testing..."
    curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://127.0.0.1:4001
    curl -s -o /dev/null -w "Backend: %{http_code}\n" http://127.0.0.1:8003/api/health
    echo ""
    echo "Done! Visit: https://bensroadservice247.com"
else
    echo "✗ Build failed"
fi
