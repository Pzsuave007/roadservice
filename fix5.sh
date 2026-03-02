#!/bin/bash

echo "Final fix for frontend build..."

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 18

cd /opt/bensroadservice/frontend

# Clean everything
echo "Cleaning..."
rm -rf node_modules package-lock.json build

# Create .env
cat > .env << 'EOF'
REACT_APP_BACKEND_URL=https://bensroadservice247.com
SKIP_PREFLIGHT_CHECK=true
DISABLE_ESLINT_PLUGIN=true
EOF

# Install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Fix the problematic package
echo "Fixing fork-ts-checker-webpack-plugin..."
npm install fork-ts-checker-webpack-plugin@6.5.3 --legacy-peer-deps

# Build
echo "Building..."
export SKIP_PREFLIGHT_CHECK=true
export DISABLE_ESLINT_PLUGIN=true
npm run build

if [ -d "build" ]; then
    echo ""
    echo "✓ BUILD SUCCESSFUL!"
    echo ""
    sudo systemctl restart bensroad-frontend
    sudo systemctl restart bensroad-backend
    sleep 3
    echo "Frontend: $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4001)"
    echo "Backend: $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8003/api/health)"
    echo ""
    echo "Visit: https://bensroadservice247.com"
else
    echo "✗ Build failed"
fi
