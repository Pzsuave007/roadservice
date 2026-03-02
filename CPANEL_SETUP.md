# Ben's Road Service - cPanel Deployment Guide
# For GoDaddy VPS (AlmaLinux 9 + cPanel + Apache)

## Quick Setup Steps

### Step 1: Upload Files via cPanel File Manager

1. Login to cPanel
2. Go to **File Manager**
3. Navigate to your domain's folder (e.g., `/home/username/bensroadservice.com`)
4. Upload all files from this repository

---

### Step 2: Setup Backend (SSH Required)

Connect via SSH and run:

```bash
# Navigate to your site folder
cd /home/username/bensroadservice.com

# Setup Python virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Create environment file
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=bens_road_service
EOF

# Test the backend
uvicorn server:app --host 127.0.0.1 --port 8001
# Press Ctrl+C to stop after testing
```

---

### Step 3: Create Backend Service

```bash
# Create systemd service
sudo nano /etc/systemd/system/bens-backend.service
```

Paste this content:

```ini
[Unit]
Description=Ben's Road Service Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/username/bensroadservice.com/backend
Environment="PATH=/home/username/bensroadservice.com/backend/venv/bin"
ExecStart=/home/username/bensroadservice.com/backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then run:

```bash
sudo systemctl daemon-reload
sudo systemctl enable bens-backend
sudo systemctl start bens-backend
sudo systemctl status bens-backend
```

---

### Step 4: Build Frontend

```bash
cd /home/username/bensroadservice.com/frontend

# Create production environment file
echo "REACT_APP_BACKEND_URL=https://bensroadservice.com" > .env

# Install dependencies and build
npm install --legacy-peer-deps
npm run build

# Copy built files to public_html
cp -r build/* /home/username/public_html/
```

---

### Step 5: Configure Apache Proxy in cPanel

#### Option A: Using .htaccess (Easiest)

Copy the `.htaccess` file to your `public_html` folder.

#### Option B: Using cPanel Apache Configuration

1. Go to cPanel → **Apache Configuration** or **ModSecurity**
2. Add these lines to your virtual host:

```apache
ProxyPreserveHost On
ProxyPass /api/ http://127.0.0.1:8001/api/
ProxyPassReverse /api/ http://127.0.0.1:8001/api/
```

---

### Step 6: Enable SELinux for Proxy (Important!)

```bash
sudo setsebool -P httpd_can_network_connect 1
```

---

### Step 7: Setup SSL (cPanel)

1. Go to cPanel → **SSL/TLS**
2. Use **AutoSSL** or install Let's Encrypt
3. Your site will be available at `https://bensroadservice.com`

---

## Troubleshooting

### API calls return 503 error:
```bash
# Check if backend is running
sudo systemctl status bens-backend

# Check SELinux
sudo setsebool -P httpd_can_network_connect 1

# Check backend logs
sudo journalctl -u bens-backend -f
```

### Frontend shows blank page:
- Make sure React build files are in `public_html`
- Check `.htaccess` is in `public_html`
- Clear browser cache

### MongoDB connection error:
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# If not installed, install it:
sudo dnf install mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

---

## Useful Commands

```bash
# Restart backend
sudo systemctl restart bens-backend

# View backend logs
sudo journalctl -u bens-backend -f

# Restart Apache
sudo systemctl restart httpd

# Check Apache status
sudo systemctl status httpd

# Test Apache config
sudo httpd -t
```

---

## Admin Dashboard

- URL: https://yourdomain.com/admin
- Username: `admin`
- Password: `bensroadservice2024`

---

## Support

Phone: (971) 388-6300
Available 24/7
