# Ben's Road Service LLC - Website

24/7 Emergency Towing & Roadside Assistance in Salem, Oregon

![Ben's Road Service LLC](https://customer-assets.emergentagent.com/job_00aa8ed2-46e4-4aea-a6de-8d7e8cfaf0af/artifacts/szsdzxev_bensroadserviceslogo-horizontal.png)

## Features

- 24/7 Emergency Towing Service
- Instant Quote Calculator
- GPS Location Sharing (for stranded drivers)
- WhatsApp Integration
- Bilingual Support (English/Spanish)
- Admin Dashboard for Quote Management
- SEO Optimized with Schema Markup
- Mobile-First Responsive Design

## Tech Stack

- **Frontend**: React, Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB

---

## Quick Deploy (One Command!)

### Option 1: Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/bens-road-service.git
cd bens-road-service

# Set your domain (optional)
export DOMAIN_URL=https://yourdomain.com

# Run with Docker Compose
docker-compose up -d
```

Your site will be available at `http://localhost` (or your domain)

### Option 2: Using Deploy Script (Ubuntu/Debian)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/bens-road-service.git
cd bens-road-service

# Make script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

The script will:
1. Install Node.js, Python, MongoDB, and Nginx
2. Set up the backend with virtual environment
3. Build the frontend for production
4. Configure Nginx as reverse proxy
5. Create systemd services for auto-start
6. Optionally setup SSL with Let's Encrypt

---

## Manual Installation

### Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB 6+
- Nginx (for production)

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "MONGO_URL=mongodb://localhost:27017" > .env
echo "DB_NAME=bens_road_service" >> .env

# Run the backend
uvicorn server:app --host 0.0.0.0 --port 8001
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Create .env file
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env

# Development mode
npm start

# OR build for production
npm run build
```

---

## Admin Dashboard

Access the admin dashboard at `/admin`

- **Username**: admin
- **Password**: bensroadservice2024

Features:
- View all quote requests
- Update quote status (Pending, Contacted, Completed)
- Delete quotes
- View statistics

---

## Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=bens_road_service
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://yourdomain.com
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/quotes` | Submit a quote request |
| GET | `/api/quote/estimate` | Get instant price estimate |
| GET | `/api/admin/quotes` | Get all quotes (auth required) |
| PUT | `/api/admin/quotes/{id}` | Update quote status |
| DELETE | `/api/admin/quotes/{id}` | Delete a quote |

---

## Folder Structure

```
bens-road-service/
├── backend/
│   ├── server.py          # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   ├── Dockerfile         # Docker config
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── LandingPage.js  # Main website
│   │   ├── components/    # UI components
│   │   └── context/       # Language context
│   ├── public/
│   │   └── index.html     # SEO meta tags
│   ├── Dockerfile         # Docker config
│   ├── nginx.conf         # Nginx config
│   └── .env               # Environment variables
├── docker-compose.yml     # Docker Compose config
├── deploy.sh              # Auto-deploy script
└── README.md
```

---

## License

MIT License - Feel free to use for your own towing business!

---

## Support

For questions or issues, contact Ben's Road Service LLC:
- Phone: (971) 388-6300
- Available 24/7
