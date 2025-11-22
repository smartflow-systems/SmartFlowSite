# SmartFlow Systems Portfolio App

## Overview
SmartFlow Systems is a single-page application (SPA) portfolio site showcasing automation systems for service businesses like barbers and salons. It demonstrates booking systems, e-commerce solutions, AI bots, and other business automation tools through interactive demos and live simulated metrics. Built as a static site optimized for Replit hosting, it serves as both a marketing tool and a demo platform for SmartFlow's business automation products, highlighting next-generation AI automation.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- Single-page application using vanilla HTML, CSS, and JavaScript with hash-based routing.
- Component-based architecture without frameworks, utilizing ES6 classes for state management.
- Data-driven content system with JSON configuration files for easy updates.
- Modal-based demo system with lazy-loaded iframes for performance.
- Responsive design with a mobile-first approach.

### State Management
- Centralized application state managed through the `SmartFlowApp` class.
- Local storage for user preferences (edit mode toggle).
- Event-driven architecture with a queue system for live metrics simulation.
- Hash routing for navigation without page reloads.

### Data Layer
- JSON-based configuration system with three main data sources:
    - `site.json`: Site content, hero text, pricing tiers, and global settings.
    - `systems.json`: Product/system definitions with features, pricing, and demo URLs.
    - `live.json`: Simulated live metrics and event stream data.
- No traditional database; all data is stored as static JSON files.

### UI/UX Design System
- Dark theme with gold accents following brand guidelines.
- Utility-first CSS approach without frameworks.
- Accessibility-first design with semantic HTML and ARIA attributes.
- Smooth animations and transitions for a professional feel.

### Performance Optimizations
- Lazy loading for demo iframes and images.
- Minimal external dependencies for fast loading.
- Efficient DOM manipulation with event delegation.

### Technical Implementations & Feature Specifications
- **Booking System**: Integration with Calendly and email fallback.
- **Lead Capture**: Forms integrated with Google Sheets webhooks and local JSONL storage (`data/leads.jsonl`), with optional SMTP email alerts.
- **AI Features**: Showcase of AI Review Response Manager, Smart Upsell Engine, Voice AI Assistant, Virtual Queue Pro, and AR Try-On Studio.
- **Content Management**: Node.js build system (`scripts/build.js`) for static page generation from Markdown content, supporting YAML front-matter.
- **Admin Interface**: No-backend `/admin.html` for content drafting.
- **Social Tools**: `/tools/social.html` for AI-powered caption and hashtag generation.
- **Pricing**: Data-driven pricing page loading from `pricing.json`.
- **Health Checks**: Dedicated `/health`, `/healthz`, and `/readiness` endpoints for deployment monitoring.

## External Dependencies

### Third-Party Services
- **External Demo Systems**: Referenced via iframe URLs in `systems.json`.
- **Calendly**: For booking system integration.
- **Google Sheets**: For lead capture webhooks.
- **SMTP Integration**: For email notifications (e.g., lead alerts).

### Static Assets
- SVG icons and graphics stored in the `/assets/` directory.
- System font stack (SF Pro Display, Inter, Segoe UI) with fallbacks.

### Browser APIs
- Local Storage.
- Hash routing (`window.location.hash`).
- Fetch API for JSON configuration files.
- DOM manipulation APIs.

### Development & Deployment Environment
- **Active Server**: Node.js/Express server (`server.js`) serving static files from the `/public` directory.
- **Legacy Files**: Python/Flask files (`app.py`, `server.py`, `main.py`, `wsgi.py`) exist but are not currently used.
- **Deployment Configuration**: `replit.toml` and `.replit` configure the server to run `node server.js` on port 5000.
- **Development Tools**: Browser developer tools for debugging.