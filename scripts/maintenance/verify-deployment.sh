#!/usr/bin/env bash
set -euo pipefail

echo "🚀 SmartFlow Systems - Deployment Verification"
echo "=============================================="
echo ""

# Check if server is running
echo "1. Checking server process..."
if pgrep -f "node.*server.js" > /dev/null; then
    echo "✅ Node.js server is running"
    echo "   Process: $(pgrep -f 'node.*server.js')"
else
    echo "❌ No Node.js server found"
    echo "💡 Run: cd apps/main-site && node server.js"
    exit 1
fi

echo ""
echo "2. Checking port 5000..."
if netstat -an | grep -q ":5000 "; then
    echo "✅ Port 5000 is in use"
else
    echo "❌ Port 5000 is not active"
fi

echo ""
echo "3. Testing health endpoints..."

# Test health endpoint
echo "Testing /health..."
if curl -s -f "http://localhost:5000/health" > /dev/null 2>&1; then
    echo "✅ /health endpoint is working"
    echo "   Response: $(curl -s 'http://localhost:5000/health')"
else
    echo "❌ /health endpoint failed"
fi

echo ""
echo "Testing /api/health..."
if curl -s -f "http://localhost:5000/api/health" > /dev/null 2>&1; then
    echo "✅ /api/health endpoint is working" 
    echo "   Response: $(curl -s 'http://localhost:5000/api/health')"
else
    echo "❌ /api/health endpoint failed"
fi

echo ""
echo "4. Browser access URLs:"
echo "   Main Site:    http://localhost:5000"
echo "   Health Check: http://localhost:5000/health"
echo "   API Health:   http://localhost:5000/api/health"

echo ""
echo "🎉 Verification completed!"