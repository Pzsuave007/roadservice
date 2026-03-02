# Server Setup for Ben's Road Service on GoDaddy VPS (AlmaLinux 9 + cPanel)

**Important:** Uses Apache, NOT nginx

## Architecture Overview

```
Internet → Apache (port 80/443) → .htaccess proxy rules → Backend (port 8002) / Frontend (port 3001)
```

## Directory Structure

```
/root/roadservice/           # Git repository (source code)
/opt/bensroadservice/        # Production deployment
  ├── backend/
  │   ├── server.py
  │   ├── requirements.txt
  │   ├── venv/
  │   └── .env               # Contains MONGO_URL, DB_NAME
  └── frontend/
      ├── src/
      └── build/             # Compiled React app (npm build output)
```

## Services (systemd)

### Backend Service: `/etc/systemd/system/bensroad-backend.service`

```ini
[Unit]
Description=Ben's Road Service Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/bensroadservice/backend
ExecStart=/opt/bensroadservice/backend/venv/bin/python3 -m uvicorn server:app --host 0.0.0.0 --port 8002
Restart=always
EnvironmentFile=/opt/bensroadservice/backend/.env

[Install]
WantedBy=multi-user.target
```

### Frontend Service: `/etc/systemd/system/bensroad-frontend.service`

```ini
[Unit]
Description=Ben's Road Service Frontend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/bensroadservice/frontend
ExecStart=/usr/bin/npx serve -s build -l 3001
Restart=always

[Install]
WantedBy=multi-user.target
```

## Apache Proxy Configuration (.htaccess)

Located at the document root for the domain (e.g., `/home/bensroaduni2/public_html/.htaccess`):

```apache
RewriteEngine On

# Proxy API requests to backend (port 8002)
RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^api/(.*)$ http://127.0.0.1:8002/api/$1 [P,L]

# Proxy all other requests to frontend (port 3001)
RewriteCond %{REQUEST_URI} !^/api
RewriteRule ^(.*)$ http://127.0.0.1:3001/$1 [P,L]
```

**Note:** Apache must have `mod_proxy` and `mod_rewrite` enabled.

## Key Commands

```bash
# Start/restart services
sudo systemctl restart bensroad-backend
sudo systemctl restart bensroad-frontend

# Check status
sudo systemctl status bensroad-backend
sudo systemctl status bensroad-frontend

# View logs
journalctl -u bensroad-backend -f
journalctl -u bensroad-frontend -f
```

## Update Script (`/root/roadservice/update.sh`)

```bash
#!/bin/bash
cd /root/roadservice
git fetch origin
git pull origin main
cp -r backend/* /opt/bensroadservice/backend/
cp -r frontend/* /opt/bensroadservice/frontend/
cd /opt/bensroadservice/frontend
npm install --legacy-peer-deps
npm run build
sudo systemctl restart bensroad-backend
sudo systemctl restart bensroad-frontend
echo "✓ Update complete!"
```

## Environment Variables (`/opt/bensroadservice/backend/.env`)

```
MONGO_URL=mongodb://localhost:27017
DB_NAME=bens_road_service
```

## Ports

- **Backend:** 8002 (FastAPI/Uvicorn)
- **Frontend:** 3001 (serve -s build)
- **MongoDB:** 27017

## Admin Dashboard

- **URL:** https://bensroadservice247.com/admin
- **Username:** admin
- **Password:** bensroadservice2024

## Troubleshooting

### Site not loading?
```bash
# Check if services are running
sudo systemctl status bensroad-backend
sudo systemctl status bensroad-frontend

# Check SELinux
sudo setsebool -P httpd_can_network_connect 1

# Check logs
journalctl -u bensroad-backend -f
journalctl -u bensroad-frontend -f
```

### API returning 503?
```bash
# Make sure SELinux allows Apache to proxy
sudo setsebool -P httpd_can_network_connect 1

# Restart Apache
sudo systemctl restart httpd
```
