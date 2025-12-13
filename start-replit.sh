#!/bin/bash

echo "🚀 Starting SmartFlow Systems on Replit..."
echo "=========================================="

# Change to main-site directory
cd apps/main-site

echo "📦 Installing dependencies..."
npm install --production

echo "🔧 Setting up environment..."
# Copy .env.example to .env if it doesn't exist
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env from template"
    fi
fi

echo "🌟 Starting SmartFlow application..."
echo "🔗 Your app will be available at: https://$REPL_SLUG.$REPL_OWNER.repl.co"
echo ""

# Start the application
node server.js