# SmartFlow Systems Portfolio App

## Overview

SmartFlow Systems is a single-page application (SPA) portfolio site showcasing automation systems for service businesses like barbers and salons. The app demonstrates booking systems, e-commerce solutions, AI bots, and other business automation tools through interactive demos and live simulated metrics. Built as a static site optimized for Replit hosting, it serves as both a marketing tool and demo platform for SmartFlow's business automation products.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

**Frontend Architecture:**
- Single-page application using vanilla HTML, CSS, and JavaScript with hash-based routing
- Component-based architecture without frameworks, using ES6 classes for state management
- Data-driven content system with JSON configuration files for easy updates
- Modal-based demo system with lazy-loaded iframes for performance
- Responsive design with mobile-first approach

**State Management:**
- Centralized application state managed through the `SmartFlowApp` class
- Local storage for user preferences (edit mode toggle)
- Event-driven architecture with queue system for live metrics simulation
- Hash routing for navigation without page reloads

**Data Layer:**
- JSON-based configuration system with three main data sources:
  - `site.json` - Site content, hero text, pricing tiers, and global settings
  - `systems.json` - Product/system definitions with features, pricing, and demo URLs
  - `live.json` - Simulated live metrics and event stream data
- No database required - all data stored as static JSON files

**UI/UX Design System:**
- Dark theme with gold accents following brand guidelines
- Utility-first CSS approach without frameworks
- Accessibility-first design with semantic HTML and ARIA attributes
- Smooth animations and transitions for professional feel

**Performance Optimizations:**
- Lazy loading for demo iframes to reduce initial load time
- Image optimization with lazy loading attributes
- Minimal external dependencies for fast loading
- Efficient DOM manipulation with event delegation

## External Dependencies

**Third-Party Services:**
- Demo systems hosted externally (referenced via iframe URLs in systems.json)
- Social media platform integrations (placeholders for future implementation)
- Email service integration (placeholder mailto links for contact form)

**Static Assets:**
- SVG icons and graphics stored in `/assets/` directory
- System fonts stack (SF Pro Display, Inter, Segoe UI) with fallbacks
- No external CDNs or font loading for optimal performance

**Browser APIs:**
- Local Storage for user preferences persistence
- Hash routing using `window.location.hash`
- Fetch API for loading JSON configuration files
- DOM manipulation APIs for dynamic content rendering

**Development Tools:**
- Custom Python web server (`server.py`) for proper deployment health checks
- No build tools or preprocessing required
- Direct deployment to Replit cloud hosting with proper HTTP server
- JSON validation for configuration files
- Browser developer tools for debugging and performance monitoring

## Recent Changes

**August 17, 2025 - Complete Brand Asset Pack Generation**
- ✅ **Brand asset generator tool**: Created `tools/smartflo_brand_pack.py` for comprehensive asset generation
- ✅ **Full favicon set**: Generated 16px to 512px favicons and PWA icons using brand wave motif
- ✅ **Social media assets**: Created optimized images for Instagram, Facebook, LinkedIn, Twitter
- ✅ **Open Graph hero images**: Generated branded OG images with headline "Booking • Ecom • AI Bots"
- ✅ **SEO meta injection**: Injected complete meta tags, JSON-LD schema, and PWA manifest
- ✅ **Marketing assets**: Created launch caption and social media ready graphics
- ✅ **Cross-platform compatibility**: Generated Apple touch icons, Android Chrome icons, browserconfig
- ✅ **Asset organization**: Structured all brand assets in `/assets/icons/` and `/assets/og/`
- ✅ **Production deployment**: Fixed port conflicts and verified server running on port 5000

**August 17, 2025 - Production-Ready Deployment Configuration**  
- ✅ **Fixed deployment health check issues**: Enhanced server.py with production-ready HTTP handler
- ✅ **Added dedicated health check endpoint**: `/health` returns JSON status for deployment monitoring  
- ✅ **Improved main.py entry point**: Added deployment validation and error handling
- ✅ **Enhanced HTTP responses**: Root endpoint (/) properly serves index.html with 200 status
- ✅ **Added deployment headers**: Security headers and proper CORS configuration
- ✅ **Graceful shutdown handling**: Signal handlers for SIGTERM/SIGINT in cloud environments
- ✅ **Port binding optimization**: Proper socket reuse and deployment PORT environment handling
- ✅ **Static file validation**: Pre-flight checks ensure all required assets exist
- ✅ **Production logging**: Cleaner log output suitable for deployment monitoring
- ✅ **Workflow configuration**: Updated to use `python main.py` with proper port binding

**August 17, 2025 - Mini Content Management System Implementation**
- ✅ **Node.js build system**: Created `scripts/build.js` with marked@12 for Markdown parsing
- ✅ **Content structure**: Set up `/content/posts/` and `/content/updates/` directories
- ✅ **Static page generation**: Blog index, individual posts, updates page, RSS feed, sitemap
- ✅ **Front-matter parsing**: YAML front-matter support for title, date, tags, excerpt
- ✅ **Admin interface**: No-backend `/admin.html` for drafting and exporting content
- ✅ **Social tools**: `/tools/social.html` for AI-powered caption and hashtag generation
- ✅ **GitHub Actions**: Daily rebuild workflow for automated content updates
- ✅ **Latest posts integration**: Added "Latest from SmartFlow" section to homepage
- ✅ **Navigation updates**: Added Blog and Updates links to header navigation
- ✅ **Content workflow**: Markdown → JSON → Static HTML pipeline with SEO optimization