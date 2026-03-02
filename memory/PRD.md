# Ben's Road Service LLC - Product Requirements Document

## Original Problem Statement
Create a high-converting, single-page landing website for a professional Towing & Roadside Assistance company named "Ben's Road Service LLC".

## Product Goals
- Generate immediate phone calls
- Capture SMS leads
- Collect quote requests
- Build trust with potential customers

## Core Requirements
- **Design:** Modern, strong, bold, fast-loading, mobile-first, emergency-service oriented
- **Bilingual:** English and Spanish support
- **Quote Tool:** Estimate calculator with admin visibility
- **Contact:** Phone/Text at 971-388-6300, 24/7
- **Service Area:** Salem, OR (up to 100 miles)

## Tech Stack
- **Frontend:** React, TailwindCSS, Craco
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **Deployment:** GoDaddy VPS, Apache, systemd

## Production Server Configuration
- **Backend Port:** 8010 (unique to this project)
- **Backend Service:** bensroad-backend.service
- **Project Directory:** ~/roadservice

## Completed Features
- ✅ Bilingual interface (EN/ES)
- ✅ Quote calculator with geolocation
- ✅ Admin dashboard for viewing quotes
- ✅ WhatsApp integration
- ✅ Emergency "Send My Location" feature
- ✅ Expandable FAB menu (Call, WhatsApp, Text, Location, Estimate)
- ✅ Company logo and branding (red theme)
- ✅ Mobile responsive design
- ✅ SEO optimization (meta tags, schema markup)
- ✅ Deployed to production server

## Key API Endpoints
- `POST /api/quote/estimate` - Get price estimate
- `POST /api/quote/request` - Submit quote request
- `GET /api/admin/quotes` - Admin: view all quotes
- `PATCH /api/admin/quotes/{id}` - Admin: update quote status

## Database Schema
**quotes collection:**
```
{
  id: string,
  pickup_location: string,
  dropoff_location: string,
  vehicle_type: string,
  service_type: string,
  phone_number: string,
  estimated_distance: float,
  estimated_price: float,
  status: string (pending/contacted/completed/cancelled),
  created_at: datetime
}
```

## Deployment Notes
**IMPORTANT:** Do NOT build frontend on the user's server. Use pre-built artifacts:
1. Build frontend in Emergent environment
2. Create `frontend-build.tar.gz`
3. User pulls repo and runs `install.sh` to extract

## Backlog

### P1 - High Priority
- [ ] Secure admin dashboard with login system

### P2 - Medium Priority
- [ ] Refactor LandingPage.js into smaller components
- [ ] Clean up redundant deployment scripts

### P3 - Low Priority
- [ ] Email/SMS notifications for new quotes
- [ ] Add more client photos

## Bug Fixes Log
- **2024-03-02:** Fixed quote estimator error - changed backend port from 8001 to 8010 to avoid conflict with other projects, installed missing `motor` module
