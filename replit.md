# SmartFlow Systems Portfolio App

## Overview
SmartFlow Systems is a single-page application (SPA) portfolio site showcasing automation systems for service businesses like barbers and salons. The app demonstrates booking systems, e-commerce solutions, AI bots, and other business automation tools through interactive demos and live simulated metrics. Built as a static site optimized for Replit hosting, it serves as both a marketing tool and demo platform for SmartFlow's business automation products, highlighting next-generation AI automation and offering solutions for lead capture, dynamic pricing, and comprehensive business automation.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

**Frontend Architecture:**
- Single-page application using vanilla HTML, CSS, and JavaScript with hash-based routing.
- Component-based architecture without frameworks, using ES6 classes for state management.
- Data-driven content system with JSON configuration files for easy updates.
- Modal-based demo system with lazy-loaded iframes for performance.
- Responsive design with a mobile-first approach.
- Includes dedicated pages for individual projects (AI Bot, Booking, E-commerce, Websites) and a social caption tool.

**State Management:**
- Centralized application state managed through the `SmartFlowApp` class.
- Local storage for user preferences (edit mode toggle).
- Event-driven architecture with a queue system for live metrics simulation.
- Hash routing for navigation without page reloads.

**Data Layer:**
- JSON-based configuration system with data sources like `site.json`, `systems.json`, and `live.json`.
- `site.config.json` for managing URLs, webhooks, and lead magnets.
- `pricing.json` for data-driven pricing card generation and structured plan data.
- Lead capture data stored in `data/leads.jsonl` (JSON Lines) with backward compatibility for `data.csv`.
- No traditional database required, all data stored as static JSON/CSV files.
- Content managed through a mini CMS generating static pages from Markdown files (`/content/posts/`, `/content/updates/`).

**UI/UX Design System:**
- Dark theme with gold accents following brand guidelines.
- Utility-first CSS approach without frameworks.
- Accessibility-first design with semantic HTML and ARIA attributes.
- Smooth animations and transitions for a professional feel.

**Technical Implementations:**
- Client-side form validation with success/error state handling.
- Enhanced `app.js` to load latest posts from multiple JSON sources.
- Server-side lead capture API (POST /lead) for storing leads and optional SMTP email alerts.
- Admin dashboard (`admin.html`) with basic authentication to view and export lead data.
- API endpoints for lead viewing (`/api/leads`) and configuration (`/api/config`).
- Comprehensive SEO optimization including `robots.txt`, `sitemap.xml`, and structured data.

**Performance Optimizations:**
- Lazy loading for demo iframes and images.
- Minimal external dependencies for fast loading.
- Efficient DOM manipulation with event delegation.

**System Design Choices:**
- Clean Flask architecture for the backend with proper routing and health checks.
- WSGI-ready application factory pattern for production deployments.
- Multiple deployment entry points (`main.py`, `run`, `replit.toml`).
- Health check endpoints (`/health`, `/healthz`, `/readiness`, `/status`) for deployment monitoring.
- Production server configured with Gunicorn, using proper port binding and error handling.
- `site.config.json` for externalizing key application settings.
- Content workflow: Markdown → JSON → Static HTML pipeline with SEO optimization.

## External Dependencies

**Third-Party Services:**
- External demo systems referenced via iframe URLs.
- Calendly integration for booking (`book.html`).
- Google Sheets webhook integration for lead capture (historical, now primarily internal JSON/CSV).
- Optional SMTP for email notifications.

**Static Assets:**
- SVG icons and graphics stored in `/assets/` directory.
- System fonts stack (SF Pro Display, Inter, Segoe UI) with fallbacks, no external CDNs.
- Downloadable resources in `assets/` folder.

**Browser APIs:**
- Local Storage for user preferences.
- Hash routing using `window.location.hash`.
- Fetch API for loading JSON configuration files.
- DOM manipulation APIs for dynamic content rendering.

**Development & Deployment Tools:**
- Flask framework for the Python web server.
- Gunicorn for production server deployment.
- `replit.toml` for Replit-specific deployment configuration.
- GitHub Actions for CI/CD pipeline and automated content updates.
- Dependabot for automated dependency updates.
- `marked@12` for Markdown parsing in the content build system.
- `data/posts.json` and other content-related JSON files.
- Browser developer tools for debugging.