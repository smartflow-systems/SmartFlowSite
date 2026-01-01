# SmartFlow Systems Portfolio App

## Overview
SmartFlow Systems is a single-page application (SPA) portfolio site showcasing 30+ automation systems for service businesses like barbers and salons. It demonstrates booking systems, e-commerce solutions, AI bots, and other business automation tools through interactive demo cards. Built as a static site optimized for Replit hosting, it serves as both a marketing tool and a platform for showcasing SmartFlow's next-generation AI automation products.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- Single-page application using vanilla HTML, CSS, and JavaScript with hash-based routing.
- Dynamic card system loading 30+ apps from JSON configuration (`systems.json`).
- Component-based styling with CSS Grid for responsive layouts.
- Responsive design with a mobile-first approach.

### State Management
- Centralized data loading through `projects.js` which fetches and renders cards from JSON.
- Client-side rendering of project cards with lazy loading via JavaScript.
- Event-driven navigation with clickable cards linking to live demos or GitHub repos.

### Data Layer
- JSON-based configuration system:
    - `systems.json`: 30+ automation systems with descriptions, tags, icons, and links
    - `posts.json`: Latest updates from SmartFlow
    - `live.json`: Simulated live metrics (deprecated)
- All data is stored as static JSON files in `/public/data/`

### UI/UX Design System
- Dark theme (#0D0D0D) with gold accents (#FFD700) following brand guidelines
- Glass-morphism cards with backdrop blur effects
- Utility-first CSS approach without frameworks
- Accessibility-first design with semantic HTML and ARIA attributes
- Smooth hover animations and transitions for professional feel
- Grid layout system with 6-7 cards per row (responsive from mobile to desktop)

### Performance Optimizations
- Lazy loading for project cards via JavaScript
- Minimal external dependencies
- Efficient DOM manipulation with single innerHTML update
- No-cache headers for HTML, 7-day cache for static assets

### Technical Implementations & Feature Specifications
- **30 SFS Apps**: BookFlow Pro, SmartCommerce Suite, AI Social Bot Pro, GrowthFlow Analytics, WebBuilder Pro, PaymentFlow Gateway, Virtual Queue Pro, AR Try-On Studio, Review Flow Manager, EmailFlow Pro, SMSFlow Messaging, InvoiceFlow Pro, InventoryFlow Manager, StaffFlow Scheduler, LoyaltyFlow Rewards, ChatFlow AI Bot, FormFlow Builder, VideoFlow Studio, WebinarFlow Pro, AffiliateFlow Platform, Client Portal Pro, FeedbackFlow Survey, AppointmentFlow Plus, SearchFlow SEO Tool, ReportFlow Analytics, IntegrationFlow Hub, DocumentFlow Manager, TrainingFlow Academy, CommunityFlow Hub, SupportFlow Helpdesk
- **Card System**: Dynamic rendering of 30 project cards from `systems.json` with descriptions, tags, emoji icons, and clickable links
- **Navigation**: Sticky header with logo, navigation menu, and "Get Started" button
- **Lead Capture**: Forms for email capture with Google Sheets webhooks (optional)
- **Content Management**: JSON-based content system for easy updates without code changes

## External Dependencies

### Third-Party Services
- **Calendly**: For booking integration links
- **GitHub**: For code repository links
- **Replit Cloud**: Deployment and hosting

### Static Assets
- SVG icons and graphics stored in `/assets/` directory
- Logo package with multiple sizes and formats (88px header size)
- System font stack (SF Pro Display, Inter, Segoe UI) with fallbacks

### Browser APIs
- Fetch API for JSON data loading
- DOM manipulation for card rendering
- Hash routing (`window.location.hash`)

### Development & Deployment Environment
- **Active Server**: Node.js/Express server (`server.js`) serving static files from `/public`
- **Deployment**: `replit.toml` configured to run `node server.js` on port 5000
- **CSS**: Single compiled `styles.css` with all theme and component styles

## Recent Changes (Dec 7, 2025)

### SFS Design Kit Integration
- ✅ Saved **SFS-DESIGN-KIT-SETUP-GUIDE.md** as reference for future React apps
- ✅ Added SFS Design Kit CSS patterns to `styles.css`:
  - Glass card utility class (`.glass-card`)
  - Sidebar item styling (`.sidebar-item`)
  - Custom scrollbar styling (`.custom-scrollbar`)
  - **11 animation classes**: fade-in, slide-up, scale-in, slide-in-left/right, bounce-in, pulse-glow, shimmer, page-transition, stagger-animation
  - **2 hover effects**: hover-lift, hover-glow
  - **6 color utilities**: bg-sfs-black, bg-sfs-brown, bg-sfs-gold, text-sfs-gold, text-sfs-beige, border-sfs-gold

### Bug Fixes & Features
- ✅ Fixed XSS vulnerability report (confirmed false positive - code uses safe DOM methods)
- ✅ Restored animated circuit background (`circuit-bg.js`)
- ✅ Fixed SFS app connection to cards (changed `p.link` → `p.demoUrl`)
- ✅ Increased circuit animation opacity for visibility (0.35 → 0.7)
- ✅ Successfully pushed 12 commits to GitHub (branch protection verified)

### Previous Changes (Nov 30, 2025)
- ✅ Expanded from 6 hardcoded cards to **30 dynamic cards**
- ✅ Created `projects.js` for dynamic card rendering from JSON
- ✅ Updated `systems.json` with 30 complete SFS apps
- ✅ **Hamburger menu** with smooth slide-in animation
- ✅ Optimized CSS grid - displays 5-7 cards per row

## File Structure

```
public/
├── index.html           # Main entry point
├── styles.css           # All styling (grid, cards, animations, menu)
├── projects.js          # Project card renderer (loads from JSON)
├── menu.js              # Hamburger menu toggle & sidebar
├── app.js               # Legacy app initialization
├── data/
│   ├── systems.json     # 30 SFS app definitions
│   ├── posts.json       # Latest updates
│   └── leads.jsonl      # Captured leads (generated)
└── assets/              # Logos, images, fonts

server.js              # Express server (port 5000)
replit.md              # This file
```

## Next Steps
- User can clone template to create new SFS app portfolios
- Each card is clickable and links to live demo or GitHub
- Easy to add more apps by editing `systems.json`
- CSS is production-ready with gold theme and glass-morphism effects
