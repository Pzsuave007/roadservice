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
- **Auto-start:** Enabled via systemd

## Admin Credentials
- **URL:** https://bensroadservice247.com/admin
- **Username:** admin
- **Password:** bensroadservice2024

## Completed Features
- ✅ Bilingual interface (EN/ES) with "Español" toggle
- ✅ Quote calculator with geolocation
- ✅ **Auto-calculate distance** between pickup and dropoff locations
- ✅ Admin dashboard for viewing quotes
- ✅ **Admin Settings Panel** - Ben can change phone, pricing, rates
- ✅ Emergency "Send My Location" feature
- ✅ Expandable FAB menu (Call, Text, Location, Estimate)
- ✅ Company logo and branding (red theme)
- ✅ Mobile responsive design
- ✅ SEO optimization (meta tags, schema markup)
- ✅ Deployed to production server with SSL pending
- ✅ Auto-start on server reboot enabled

## Recent Changes (March 2026)
- Removed "Licensed" badge from hero section
- Changed hero background image to Light Duty truck
- Changed "Heavy Duty" to "Light Duty" in fleet section
- Changed "We work with all insurance companies" to "We work with you!"
- Removed ALL WhatsApp references (client doesn't use WhatsApp)
- Changed language toggle from "ES" to "Español"
- Updated FAQ pricing to show range ($75-$125)
- Added auto-calculate distance feature
- Added Admin Settings panel for phone/pricing management
- Created server management script for all projects

## Key API Endpoints
- `GET /api/settings/public` - Get public settings (phone, company name)
- `POST /api/quote/estimate` - Get price estimate
- `POST /api/quote/request` - Submit quote request
- `GET /api/admin/quotes` - Admin: view all quotes
- `GET /api/admin/settings` - Admin: get all settings
- `PUT /api/admin/settings` - Admin: update settings
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

**settings collection:**
```
{
  _id: "site_settings",
  phone_number: string,
  phone_display: string,
  company_name: string,
  service_area: string,
  mileage_rate: float,
  emergency_fee: float,
  base_prices: { service_type: price },
  vehicle_multipliers: { vehicle_type: multiplier }
}
```

## Server Management
Script location: `~/roadservice/manage-services.sh`

Commands:
- `./manage-services.sh status` - Check all backends
- `./manage-services.sh enable-all` - Enable auto-start
- `./manage-services.sh restart-all` - Restart all services
- `./manage-services.sh logs <service>` - View logs

## Deployment Notes
**IMPORTANT:** Do NOT build frontend on the user's server. Use pre-built artifacts:
1. Build frontend in Emergent environment
2. Create `frontend-build.tar.gz`
3. User pulls repo and runs `install.sh` to extract

## Backlog

### P1 - High Priority
- [ ] Install SSL certificate (script created: install-ssl-v2.sh)

### P2 - Medium Priority  
- [ ] Refactor LandingPage.js into smaller components
- [ ] Clean up redundant deployment scripts

### P3 - Low Priority
- [ ] Email/SMS notifications for new quotes
- [ ] Add more client photos

## Bug Fixes Log
- **2026-03-02:** Fixed quote estimator - changed port from 8001 to 8010
- **2026-03-03:** Fixed distance input on mobile, added auto-calculate feature
- **2026-03-03:** Added admin settings panel for client self-management
