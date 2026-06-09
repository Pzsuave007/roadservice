# Ben's Road Service LLC - Product Requirements Document

## [2026-06-09] Imágenes localizadas y desplegables
- Imágenes migradas de CDN Emergent a locales (`/frontend/public/images/`: logo.png, truck1-5.jpeg). `LandingPage.js` referencia `/images/...`.
- Frontend recompilado con `REACT_APP_BACKEND_URL=https://bensroadservice247.com` y empaquetado en `frontend-build.tar.gz` (incluye imágenes). Verificado: las 6 imágenes cargan en preview. Pendiente: usuario despliega vía Save to Github + `git pull && ./install.sh`.

## Original Problem Statement
Create a high-converting, single-page landing website for a professional Towing & Roadside Assistance company named "Ben's Road Service LLC".

## Product Goals
- Generate immediate phone calls
- Capture SMS leads with vehicle info and photos
- Build trust with potential customers

## Tech Stack
- **Frontend:** React, TailwindCSS
- **Backend:** FastAPI (Python) on port 8010
- **Database:** MongoDB
- **Deployment:** GoDaddy VPS, Apache with proxy

## Production URLs
- **Website:** https://bensroadservice247.com
- **Admin:** https://bensroadservice247.com/admin

## Admin Credentials
- **Username:** admin
- **Password:** bensroadservice2024

## Completed Features
- ✅ Bilingual interface (EN/ES) with "Español" toggle
- ✅ Simple contact form (no error-prone calculators)
- ✅ Auto-calculate distance between locations
- ✅ **Vehicle photo upload** - Ben receives link to see vehicle
- ✅ SMS pre-filled with: Vehicle type, Pickup, Drop-off, Distance, Photo link, Phone
- ✅ Admin dashboard for viewing quotes
- ✅ Admin Settings Panel - change phone, pricing, rates
- ✅ Emergency "Send My Location" feature
- ✅ FAB menu (Call, Text, Location)
- ✅ Company logo and branding (red theme)
- ✅ Mobile responsive design
- ✅ SEO optimization
- ✅ Auto-start services on server reboot

## Recent Changes (May 2026)
- Removed quote calculator (was causing errors)
- Added simple contact form with: Pickup, Drop-off, Vehicle Type, Phone, Photo
- Added vehicle photo upload feature
- Auto-calculate distance when both locations entered
- SMS includes all info + photo link for Ben
- Fixed Apache proxy to use port 8010

## Key API Endpoints
- `GET /api/settings/public` - Get public settings
- `POST /api/upload/photo` - Upload vehicle photo
- `GET /api/uploads/{filename}` - Serve uploaded photos
- `GET /api/admin/quotes` - Admin: view all quotes
- `GET /api/admin/settings` - Admin: get settings
- `PUT /api/admin/settings` - Admin: update settings

## Server Configuration
- **Backend Port:** 8010
- **Frontend:** Static files in /home/bensroaduni2/
- **Uploads:** ~/roadservice/backend/uploads/
- **Apache .htaccess:** Proxies /api to port 8010

## Deployment Commands
```bash
cd ~/roadservice && git pull && ./install.sh
```

## Server Management
```bash
./manage-services.sh status      # Check all services
./manage-services.sh enable-all  # Enable auto-start
./manage-services.sh restart-all # Restart all services
```

## Backlog

### P1 - High Priority
- [ ] Install SSL certificate

### P2 - Medium Priority
- [ ] Email notifications for new quote requests
- [ ] Save quote requests to database (currently just SMS)

### P3 - Low Priority
- [ ] Add more client photos to gallery
- [ ] Refactor LandingPage.js into smaller components
