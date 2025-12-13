# SmartFlow AI - AI E-Commerce Social Media Bot Platform

## Overview

SmartFlow AI is a premium no-code AI platform designed to automate e-commerce social media sales through intelligent bot builders. The application allows users to create, manage, and deploy social media automation bots across platforms like TikTok, Instagram, Facebook, Twitter, and YouTube to increase engagement and drive revenue. Now features a complete SEO-optimized landing page, advanced analytics dashboard, comprehensive marketplace, and Stripe payment integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Updates (January 2025)

✓ **Brand Rebrand to SmartFlow AI**: Updated all branding from SFS ScaleBots to SmartFlow AI with refined messaging
✓ **PostgreSQL Database Integration**: Migrated from memory storage to PostgreSQL with complete schema and seeded data
✓ **Advanced Analytics Dashboard**: Comprehensive Chart.js integration with revenue tracking ($4,550.50), ROI metrics (340%), engagement rates, and platform performance analytics
✓ **Enhanced Marketplace**: Premium template system with category filtering, search, and gold "Apply Template" buttons with premium locks for Pro users
✓ **Smart Scheduling System**: Advanced cron UI with if-then automation rules, peak hours optimization, and engagement threshold posting
✓ **Bot Personality Designer**: Comprehensive personality sliders for tone, formality, enthusiasm, creativity with real-time preview and personality presets
✓ **Platform Integration Wizard**: Multi-step integration setup for Instagram, TikTok, Facebook, Twitter, YouTube with secure API key management
✓ **Premium Monetization**: Freemium model with 3-bot limit for free users, $49/mo Pro plan upgrade flow, premium template locks
✓ **Server-Side Rendered Landing Page**: Implemented Express SSR route for crawlable landing page with static HTML content, proper meta tags, and SEO optimization
✓ **Analytics Dashboard**: Added Chart.js integration with real-time e-commerce metrics, engagement tracking, ROI calculations, and platform performance analytics  
✓ **Enhanced Marketplace**: Created comprehensive bot template marketplace with category filtering, search functionality, and premium template system
✓ **Stripe Payment Integration**: Implemented secure payment processing for premium subscriptions with checkout flow and upgrade functionality
✓ **E-commerce Bot Presets**: Added specialized bot creation templates for product showcases, flash sales, testimonials, and trend tracking
✓ **Premium Brown & Gold Theme**: Transformed color scheme from yellow to sophisticated brown with gold trimmings for luxury aesthetic
✓ **Premium Theme Implementation**: Applied consistent dark brown base with gold accents and subtle gold glows throughout
✓ **Complete Stripe Payment Integration**: Implemented comprehensive payment processing with $49/month Pro plan subscriptions, one-time purchases, subscription management, premium template access controls, payment success notifications, and webhook support for subscription lifecycle events

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