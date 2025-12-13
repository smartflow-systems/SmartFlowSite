#!/bin/bash
set -e

echo "SmartFlow AI - Node.js Deployment Script"
echo "========================================"

# Set environment variables for production
export NODE_ENV=production
export PORT=${PORT:-3000}

echo "Environment: NODE_ENV=$NODE_ENV, PORT=$PORT"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm ci --production=false
fi

# Clean any previous builds
echo "Cleaning previous builds..."
rm -rf dist/
mkdir -p dist/

# Build the application
echo "Building frontend..."
npm run build

echo "Build completed successfully!"

# Verify the build output
if [ -f "dist/index.js" ]; then
    echo "✅ Backend bundle created: $(ls -lh dist/index.js | awk '{print $5}')"
else
    echo "❌ Backend build failed - dist/index.js not found"
    exit 1
fi

if [ -d "dist/public" ] && [ "$(ls -A dist/public 2>/dev/null)" ]; then
    file_count=$(find dist/public -type f | wc -l)
    echo "✅ Frontend assets ready: $file_count files in dist/public/"
else
    echo "⚠️ Frontend assets may be missing in dist/public/"
fi

echo ""
echo "🎉 Node.js deployment ready!"
echo "To start: npm start"