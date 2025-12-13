#!/usr/bin/env bash
set -euo pipefail

echo "🔍 SmartFlow Systems - Quick Application Test"
echo "============================================="
echo ""

# Test if main-site server is responsive
echo "Testing Main Site (Port 5000)..."
if curl -s -f "http://localhost:5000/health" > /dev/null 2>&1; then
    echo "✅ Main Site: HEALTHY"
    curl -s "http://localhost:5000/health" | head -3
else
    echo "❌ Main Site: NOT RESPONDING"
fi

echo ""
echo "Testing Main Site API Health..."
if curl -s -f "http://localhost:5000/api/health" > /dev/null 2>&1; then
    echo "✅ Main Site API: HEALTHY"  
    curl -s "http://localhost:5000/api/health" | head -3
else
    echo "❌ Main Site API: NOT RESPONDING"
fi

echo ""
echo "✅ Application test completed!"