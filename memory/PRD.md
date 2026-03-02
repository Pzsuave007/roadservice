# Ben's Road Service LLC - Landing Page PRD

## Original Problem Statement
Create a high-converting, single-page landing website for a professional Towing & Roadside Assistance company (Ben's Road Service LLC) serving Salem & up to 100 miles throughout Oregon. The site should generate phone calls, capture SMS leads, collect quote requests, and build trust.

## User Personas
1. **Stranded Driver** - Needs immediate emergency towing/roadside help
2. **Spanish-Speaking Customer** - Requires bilingual service (English/Spanish)
3. **Accident Victim** - Needs accident recovery and insurance assistance
4. **Business Owner (Ben)** - Needs to view and manage quote requests

## Core Requirements
- Bright/light theme with orange accents (updated from dark theme)
- Mobile-first, fast-loading design
- Click-to-call and text functionality
- Quote calculator with instant pricing estimate (encourages calling for exact price)
- Admin dashboard for quote management
- Bilingual support (English/Spanish)
- Location sharing for stranded drivers

## What's Been Implemented

### March 2, 2025 - Initial Build
- Full landing page with all core sections
- Quote form with pricing calculator
- Admin dashboard with authentication
- Bilingual support (EN/ES)

### March 2, 2025 - Update #2
- ✅ **Quote Section Repositioned**: Moved right after Hero for fast access
- ✅ **GPS Location Sharing**: Added "Use My Location" button with geolocation API
- ✅ **Call-First Flow**: After estimate, primary CTA is "Call Ben for Exact Price"
- ✅ **Pre-filled SMS**: "Or Text Ben" button with auto-filled message including estimate
- ✅ **100-Mile Service Map**: Google Map now shows expanded coverage area
- ✅ Light/bright theme with client's custom tow truck images

### Landing Page Sections (Current Order)
1. ✅ Sticky header with phone number, text button, 24/7 badge
2. ✅ Hero section with CTA buttons (Call Now, Get Quote)
3. ✅ **Quote Calculator** (instant pricing estimate) - NOW RIGHT AFTER HERO
4. ✅ Services section (7 services with icons)
5. ✅ Why Choose Us section (5 features)
6. ✅ Google Reviews section (4 sample reviews)
7. ✅ Our Fleet Gallery (client's truck photos)
8. ✅ Service area map (100-mile radius from Salem)
9. ✅ Accident assistance section
10. ✅ FAQ accordion (6 questions with SEO schema)
11. ✅ Final CTA section
12. ✅ Mobile floating action buttons (FAB)

### Quote Calculator Features
- ✅ **Location Sharing Button** (GPS icon) - one click to share current location
- ✅ OpenStreetMap reverse geocoding for address lookup
- ✅ Vehicle type selection (Sedan, SUV, Truck, Motorcycle, Van, Other)
- ✅ Service type selection (7 services)
- ✅ Emergency vs Scheduled toggle
- ✅ Distance input (miles)
- ✅ Phone number capture
- ✅ **Instant Estimate Display**: Shows base price, mileage, emergency fee, total
- ✅ **Call-First CTA**: "Call Ben for Exact Price" as primary action
- ✅ **Text Option**: Pre-filled SMS with service details and estimate

### Backend Features
- ✅ Quote estimate API with pricing logic
- ✅ Quote request submission API
- ✅ Admin authentication (Basic Auth)
- ✅ Admin dashboard API (stats, quote management)
- ✅ Status update and delete quote endpoints

### Pricing Structure (Adjustable)
| Service | Base Price |
|---------|------------|
| Emergency Towing | $85 |
| Flatbed Towing | $95 |
| Accident Recovery | $125 |
| Lockout Service | $55 |
| Jump Start | $45 |
| Tire Change | $55 |
| Long Distance | $100 |

- Mileage: $3.50/mile
- Emergency Fee: $25
- Vehicle Multipliers: Sedan 1.0x, SUV 1.15x, Truck 1.25x, Motorcycle 0.85x, Van 1.2x

## Prioritized Backlog

### P0 - Critical (Next Phase)
- Real Google Business integration for reviews
- SMS notification when new quote received
- Email notification system

### P1 - Important
- Logo upload/integration
- Custom Google Maps API key for better styling
- Admin password change functionality
- Quote notes/comments feature

### P2 - Nice to Have
- More detailed pricing options
- Integration with dispatch software
- Customer testimonial video section

## Technical Stack
- Frontend: React + Tailwind CSS + Shadcn/UI
- Backend: FastAPI + Python
- Database: MongoDB
- Deployment: Emergent Platform

## Admin Credentials
- Username: admin
- Password: bensroadservice2024
- URL: /admin
