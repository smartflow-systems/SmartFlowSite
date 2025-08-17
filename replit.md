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

**August 17, 2025 - Deployment Configuration Fix**
- Created custom Python web server (`server.py`) to handle deployment health checks properly
- Updated workflow configuration to use `python server.py` instead of basic HTTP server
- Fixed deployment issues by ensuring the root endpoint (/) responds with 200 status code
- Server now properly handles CORS headers and serves static files with correct responses
- Deployment target remains cloudrun with proper web server configuration