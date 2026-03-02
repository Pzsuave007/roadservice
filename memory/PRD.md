# Ben's Road Service LLC - Landing Page PRD

## Original Problem Statement
Create a high-converting, single-page landing website for a professional Towing & Roadside Assistance company (Ben's Road Service LLC) serving Salem & all of Oregon. The site should generate phone calls, capture SMS leads, collect quote requests, and build trust.

## User Personas
1. **Stranded Driver** - Needs immediate emergency towing/roadside help
2. **Spanish-Speaking Customer** - Requires bilingual service (English/Spanish)
3. **Accident Victim** - Needs accident recovery and insurance assistance
4. **Business Owner (Ben)** - Needs to view and manage quote requests

## Core Requirements
- Dark theme with orange/red emergency accents
- Mobile-first, fast-loading design
- Click-to-call and text functionality
- Quote calculator with instant pricing
- Admin dashboard for quote management
- Bilingual support (English/Spanish)

## What's Been Implemented (March 2, 2025)

### Landing Page Sections
- ✅ Sticky header with phone number, text button, 24/7 badge
- ✅ Hero section with CTA buttons (Call Now, Get Quote)
- ✅ Services section (7 services with icons)
- ✅ Quote calculator with instant pricing
- ✅ Why Choose Us section (5 features)
- ✅ Google Reviews section (4 sample reviews)
- ✅ Service area map (Google Maps embed for Salem, OR)
- ✅ Accident assistance section
- ✅ FAQ accordion (6 questions with SEO schema)
- ✅ Final CTA section
- ✅ Mobile floating action buttons (FAB)

### Backend Features
- ✅ Quote estimate API (pricing calculation)
- ✅ Quote request submission API
- ✅ Admin authentication (Basic Auth)
- ✅ Admin dashboard API (stats, quote management)
- ✅ Status update and delete quote endpoints

### Admin Dashboard
- ✅ Login page with authentication
- ✅ Stats overview (Total, Pending, Contacted, Completed)
- ✅ Quote requests table with all details
- ✅ Status update dropdown
- ✅ Delete quote functionality

### Bilingual Support
- ✅ Language toggle (EN/ES)
- ✅ All text content translated
- ✅ Persists selection during session

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
- Dark/light mode toggle
- More detailed pricing options
- Integration with dispatch software
- Customer testimonial video section

## Next Action Items
1. Add user's logo when provided
2. Set up SMS/email notifications for new quotes
3. Connect real Google Business reviews
4. Add more detailed service pricing options

## Technical Stack
- Frontend: React + Tailwind CSS + Shadcn/UI
- Backend: FastAPI + Python
- Database: MongoDB
- Deployment: Emergent Platform

## Admin Credentials
- Username: admin
- Password: bensroadservice2024
