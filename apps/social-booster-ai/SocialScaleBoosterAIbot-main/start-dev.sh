#!/bin/bash
# SmartFlow AI - Development Server Startup Script

echo "🚀 Starting SmartFlow AI Development Server"
echo "=========================================="

# Kill any existing processes on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Set development environment
export NODE_ENV=development
export PORT=3000

echo "🔧 Environment: $NODE_ENV"
echo "🌐 Port: $PORT"

# Build if needed
if [ ! -f "dist/index.js" ]; then
    echo "📦 Building application..."
    ./deploy-fix.sh
fi

# Start the development server
echo "✅ Starting development server..."
echo "📍 Access at: http://localhost:3000"
echo ""

# Use tsx for development mode
if command -v npx &> /dev/null; then
    npx tsx server/index.ts
else
    node dist/index.js
fi