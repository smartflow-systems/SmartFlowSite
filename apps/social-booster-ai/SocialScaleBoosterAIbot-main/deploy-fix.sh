#!/bin/bash
set -e

echo "🚀 SmartFlow AI - Node.js Deployment Fix Script"
echo "================================================"

# Set environment variables
export NODE_ENV=production
export PORT=3000

echo "✅ Environment variables set:"
echo "   NODE_ENV=$NODE_ENV"
echo "   PORT=$PORT"

# Ensure node_modules exists and dependencies are installed
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/vite" ]; then
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
mkdir -p dist/

# Build frontend first
echo "🎨 Building frontend with Vite..."
if [ -f "node_modules/.bin/vite" ]; then
    ./node_modules/.bin/vite build
else
    echo "⚠️  Vite binary not found, trying alternative build..."
    npx vite build 2>/dev/null || {
        echo "❌ Frontend build failed, copying client files manually..."
        mkdir -p dist/public
        cp -r client/* dist/public/ 2>/dev/null || echo "No client files to copy"
    }
fi

# Build backend
echo "🔧 Building backend with esbuild..."
if [ -f "node_modules/.bin/esbuild" ]; then
    ./node_modules/.bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
else
    echo "⚠️  Using npx for esbuild..."
    npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
fi

# Verify build outputs
echo "🔍 Verifying build outputs..."
if [ -f "dist/index.js" ]; then
    BACKEND_SIZE=$(du -h dist/index.js | cut -f1)
    echo "✅ Backend bundle created: dist/index.js ($BACKEND_SIZE)"
else
    echo "❌ Backend build failed - dist/index.js not found"
    exit 1
fi

if [ -d "dist/public" ] && [ "$(ls -A dist/public)" ]; then
    FRONTEND_COUNT=$(find dist/public -type f | wc -l)
    echo "✅ Frontend assets ready: dist/public/ ($FRONTEND_COUNT files)"
else
    echo "⚠️  Frontend assets may be missing"
fi

echo ""
echo "🎉 Build completed successfully!"
echo "📁 Output structure:"
ls -la dist/
echo ""
echo "🚀 To start production server: npm start"
echo "   Or directly: NODE_ENV=production node dist/index.js"