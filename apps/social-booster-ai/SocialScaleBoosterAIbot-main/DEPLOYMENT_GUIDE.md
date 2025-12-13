# SmartFlow AI - Dual-Mode Deployment Guide

## Overview

SmartFlow AI now supports dual-mode operation on unified port 3000:

1. **Python Flask Mode**: AI-powered social media post generator with OpenAI integration
2. **Node.js Mode**: Full SmartFlow AI platform with analytics, bot management, and marketplace

## Applications Available

### 🐍 Python Flask Mode (AI Post Generator)
- **File**: `demo_app.py` (demo version) or `app.py` (full OpenAI version)
- **Port**: 3000
- **Features**: 
  - `/api/boost` - AI post enhancement endpoint
  - `/health` - Health check endpoint
  - Social media post generation with hashtag enhancement
  - Tone adjustment (friendly/professional)
  - Vibe detection

### 🚀 Node.js Mode (Full Platform)
- **File**: `server/index.ts`
- **Port**: 3000  
- **Features**:
  - Complete SmartFlow AI dashboard
  - Bot management system
  - Analytics and metrics
  - Template marketplace
  - Stripe payment integration
  - Multi-platform social media integrations

## Running Applications

### Quick Start Commands

**Python Flask Mode:**
```bash
PORT=3000 python3 demo_app.py
```

**Node.js Mode:**
```bash
PORT=3000 NODE_ENV=development tsx server/index.ts
```

### Toggle Script Usage

Use the provided toggle script for easy switching:

```bash
# Start Python Flask mode
./toggle_mode.sh python

# Start Node.js mode
./toggle_mode.sh node
```

## Testing the Applications

### Python Flask API Testing

```bash
# Health check
curl -s http://localhost:3000/health

# Test post generation
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"post":"Your content here","tone":"professional"}' \
  http://localhost:3000/api/boost
```

### Node.js Platform Testing

```bash
# Health check (returns HTML)
curl -s http://localhost:3000/

# API endpoints
curl -s http://localhost:3000/api/user
```

## Environment Configuration

Both applications use:
- **HOST**: `0.0.0.0` (accessible from outside)
- **PORT**: `3000` (unified port)
- **Environment Variables**: All existing secrets (DATABASE_URL, OPENAI_API_KEY, STRIPE keys)

## Integration Notes

- Applications share the same environment variables
- Both support the same port configuration
- Easy switching between modes without configuration changes
- Unified deployment process

## Dependencies

### Python Requirements
- Flask, Flask-CORS
- OpenAI (for full version)
- Requests

### Node.js Requirements  
- All existing dependencies in package.json
- TypeScript, Express, React
- Database and payment integrations

## Production Deployment

Both applications are configured for production deployment on Replit:
- Automatic environment variable loading
- Health check endpoints
- Error handling and logging
- CORS configuration for cross-origin requests

Choose the mode based on your current needs:
- **Python Flask**: Simple AI post generation API
- **Node.js**: Full featured business platform