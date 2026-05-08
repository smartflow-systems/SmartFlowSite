#!/bin/bash
# SmartFlow AI - Node.js Runtime Script

# Set Node.js environment
export NODE_ENV=production
export PORT=3000

echo "🚀 Starting SmartFlow AI (Node.js)..."

# Check if dist exists, if not build it
if [ ! -f "dist/index.js" ]; then
    echo "📦 Building application..."
    if [ -f "deploy-fix.sh" ]; then
        ./deploy-fix.sh
    else
        npm run build
    fi
fi

# Start the Node.js server
echo "✅ Starting production server on port $PORT..."
node dist/index.js
