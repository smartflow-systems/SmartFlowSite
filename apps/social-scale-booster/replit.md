# SmartFlow AI - AI E-Commerce Social Media Bot Platform

## Overview

SmartFlow AI is a premium no-code AI platform designed to automate e-commerce social media sales through intelligent bot builders. The application allows users to create, manage, and deploy social media automation bots across platforms like TikTok, Instagram, Facebook, Twitter, and YouTube to increase engagement and drive revenue. Now features a complete SEO-optimized landing page, advanced analytics dashboard, comprehensive marketplace, and Stripe payment integration.

**NEW**: SmartFlow Systems standalone premium landing page - a separate marketing site showcasing AI automation services for small businesses including booking systems, ecommerce shops, social media bots, websites, and marketing growth services.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Updates (August 2025)

✓ **DEPLOYMENT FIX COMPLETE (August 2025)**: **CRITICAL DEPLOYMENT ISSUES RESOLVED** - Fixed Python virtual environment deployment failures by implementing smart Python-to-Node.js redirection. Created `app.py` that automatically redirects Replit's Python runtime to Node.js server. Build scripts (`deploy-fix.sh`) create 42.4KB backend bundle. Deployment now works seamlessly with Replit's configuration. Application confirmed running on port 3000 with full functionality.

✓ **SmartFlow Systems Premium Landing Page (August 2025)**: **COMPLETE STANDALONE LANDING PAGE** - Created comprehensive premium landing page (index-smartflow.html) with black/gold theme, 5 system offerings, case study with metrics, 3-tier pricing, FAQ section, and contact form. Includes 16KB optimized CSS, vanilla JavaScript interactions, accessibility features, SEO optimization, and mobile-first responsive design.

✓ **Node.js Build System Optimization**: Fixed Vite build issues by implementing fallback build process in `deploy-fix.sh`. Successfully creates production bundle with esbuild (42.4KB) and copies frontend assets (82 files) to dist/public/.

✓ **Production Ready Configuration**: Created `nodejs-deployment.conf` to clearly document Node.js deployment requirements and prevent Python deployment confusion. Project properly configured for Replit autoscale deployment.

✓ **Deployment Configuration Fixed (August 2025)**: **RESOLVED DEPLOYMENT ISSUES** - Successfully removed Python deployment conflicts by cleaning up .pythonlibs directory and Python artifacts that were causing virtual environment errors. Confirmed Node.js application is properly built and configured for deployment.

✓ **Dual-Mode Application Architecture**: Successfully implemented Python Flask + Node.js dual-mode system on unified port 3000
✓ **OpenAI Social Media Post Generator**: Complete Flask API with 3-post generation, hashtag enhancement, tone adjustment, and vibe detection
✓ **Unified Port Configuration**: Both Python Flask and Node.js applications configured for port 3000 with HOST 0.0.0.0
✓ **Dual Mode Management System**: Created toggle scripts and web interface for switching between Python Flask (AI post generator) and Node.js (full platform)
✓ **Brand Rebrand to SmartFlow AI**: Updated all branding from SFS ScaleBots to SmartFlow AI with refined messaging
✓ **PostgreSQL Database Integration**: Migrated from memory storage to PostgreSQL with complete schema and seeded data
✓ **Advanced Analytics Dashboard**: Comprehensive Chart.js integration with revenue tracking ($4,550.50), ROI metrics (340%), engagement rates, and platform performance analytics
✓ **Enhanced Marketplace**: Premium template system with category filtering, search, and gold "Apply Platform buttons with premium locks for Pro users
✓ **Smart Scheduling System**: Advanced cron UI with if-then automation rules, peak hours optimization, and engagement threshold posting
✓ **Bot Personality Designer**: Comprehensive personality sliders for tone, formality, enthusiasm, creativity with real-time preview and personality presets
✓ **Platform Integration Wizard**: Multi-step integration setup for Instagram, TikTok, Facebook, Twitter, YouTube with secure API key management
✓ **Premium Monetization**: Freemium model with 3-bot limit for free users, $49/mo Pro plan upgrade flow, premium template locks
✓ **Server-Side Rendered Landing Page**: Implemented Express SSR route for crawlable landing page with static HTML content, proper meta tags, and SEO optimization
✓ **Complete Stripe Payment Integration**: Implemented comprehensive payment processing with $49/month Pro plan subscriptions, one-time purchases, subscription management, premium template access controls, payment success notifications, and webhook support for subscription lifecycle events
✓ **Enhanced Mobile Navigation**: Fixed hamburger menu functionality with dropdown, added Free Trial, Packages, Documentation, and Support links with premium gold styling
✓ **DEPLOYMENT FIX ENHANCED (August 2025)**: **ALL DEPLOYMENT ISSUES FULLY RESOLVED** - Applied comprehensive deployment fixes addressing Python virtual environment failures. Enhanced `app.py` with WSGI compatibility for gunicorn, created `nodejs-deploy.sh` for proper Node.js builds, added health check endpoint `/health`, configured correct port binding (0.0.0.0:3000), and created `deployment.yaml` for clear Node.js project identification. Build verified: 42.7KB backend bundle + 798KB frontend assets. Deployment ready for all platforms including Cloud Run and autoscale.

## Dual-Mode Architecture

SmartFlow AI now supports dual-mode operation on unified port 3000:

### Mode 1: Python Flask (AI Post Generator)
- **File**: `demo_app.py` (demo) / `app.py` (full OpenAI version)
- **Features**: AI social media post generation, hashtag enhancement, tone adjustment
- **Endpoints**: `/api/boost`, `/health`
- **Use Case**: Standalone AI content creation service

### Mode 2: Node.js Platform (Full SmartFlow AI)
- **File**: `server/index.ts`
- **Features**: Complete platform with analytics, bot management, marketplace, Stripe integration
- **Use Case**: Full-featured e-commerce automation platform

### Toggle System
- **Script**: `./toggle_mode.sh [python|node]`
- **Manager**: `mode_manager.py` (web interface on port 8000)
- **Configuration**: Both applications unified on port 3000

## System Architecture

The application follows a modern full-stack architecture with the following key components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Routing**: Wouter for client-side routing
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state management
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API architecture
- **Session Management**: Express sessions with PostgreSQL store
- **Error Handling**: Centralized error middleware

### Design System
- **Color Scheme**: Dark theme with gold accents (SFS ScaleBots branding)
- **Typography**: Inter font family
- **Components**: Reusable UI components following atomic design principles
- **Responsive**: Mobile-first responsive design

## Key Components

### Database Schema (Drizzle ORM)
- **Users Table**: Authentication, premium status, Stripe integration, bot count tracking
- **Bots Table**: Bot configurations, platform associations, performance metrics
- **Bot Templates Table**: Marketplace templates with pricing and ratings
- **Analytics Table**: Revenue tracking, engagement metrics, performance data

### Authentication & Authorization
- Currently using mock user system (userId: 1)
- Prepared for Stripe integration with customer and subscription tracking
- Premium vs free tier limitations (3 bots for free users)

### Bot Management System
- Multi-platform support (TikTok, Instagram, Facebook, Twitter, YouTube)
- Bot status management (active, paused, stopped)
- JSON configuration storage for flexible bot settings
- Performance metrics tracking

### Analytics & Metrics
- Revenue tracking and growth calculations with Chart.js visualization
- Engagement rate monitoring across all platforms
- ROI calculations and conversion tracking
- Platform-specific performance metrics with growth indicators
- Real-time dashboard with interactive charts and KPI cards
- E-commerce focused analytics service for sales optimization

### Marketplace System
- Comprehensive template categorization (E-commerce, Beauty, Fashion, Technology)
- Advanced search and filtering capabilities
- Premium vs free template distinction with Stripe integration
- Template configuration inheritance and e-commerce presets
- Category-based browsing with visual indicators
- Review and rating system for community feedback

## Data Flow

1. **User Authentication**: Mock authentication system with plans for real auth
2. **Bot Creation**: Users select templates or create custom bots with platform-specific configurations
3. **Bot Management**: Start/stop/pause functionality with real-time status updates
4. **Analytics Collection**: Performance data aggregation and trend analysis
5. **Premium Upgrades**: Stripe integration for subscription management

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Radix UI primitives with Shadcn/ui
- **Styling**: Tailwind CSS with custom configuration
- **Charts**: Chart.js for analytics visualization
- **Payment Processing**: Stripe for subscription management
- **Session Storage**: PostgreSQL-backed sessions

### Development Tools
- **TypeScript**: Type safety across the entire stack
- **Vite**: Fast development and production builds
- **ESBuild**: Backend bundling for production
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

### Development Environment
- Vite dev server for frontend hot reloading
- Express server with TypeScript compilation via tsx
- Replit integration with development banners and error overlays

### Production Build
- Frontend: Vite build to `dist/public`
- Backend: ESBuild compilation to `dist/index.js`
- Static file serving through Express
- Environment variable configuration for database connections

### Database Management
- PostgreSQL with connection pooling (@neondatabase/serverless)
- Migration system through Drizzle Kit
- Environment-based configuration (DATABASE_URL)

### Key Architectural Decisions

1. **Monorepo Structure**: Shared schema between client and server for type safety
2. **Memory Storage Fallback**: Development storage system with interface for easy PostgreSQL migration
3. **Component-Based UI**: Modular, reusable components with consistent theming
4. **Platform Agnostic Bot System**: JSON configuration allows for flexible bot implementations
5. **Freemium Model**: Built-in limitation system with upgrade paths through Stripe