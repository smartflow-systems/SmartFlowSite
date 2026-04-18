#!/bin/bash

echo "🔍 SmartFlow AI - Deployment Verification Script"
echo "==============================================="

# Check project type indicators
echo "📁 Project Structure Analysis:"
echo "   Node.js indicators:"
echo "   ✅ package.json: $(test -f package.json && echo "Found" || echo "Missing")"
echo "   ✅ node_modules: $(test -d node_modules && echo "Found" || echo "Missing")"
echo "   ✅ server/index.ts: $(test -f server/index.ts && echo "Found" || echo "Missing")"

echo ""
echo "   Python indicators (should not affect deployment):"
PYTHON_FILES=$(find . -maxdepth 1 -name "*.py" 2>/dev/null | wc -l)
echo "   📝 Python files in root: $PYTHON_FILES files"
echo "   📝 requirements.txt: $(test -f requirements.txt && echo "Found (should be ignored)" || echo "Not found")"
echo "   📝 pyproject.toml: $(test -f pyproject.toml && echo "Found (should be ignored)" || echo "Not found")"

# Check build outputs
echo ""
echo "🏗️  Build System Status:"
echo "   Build script: $(test -f deploy-fix.sh && echo "✅ deploy-fix.sh ready" || echo "❌ Missing")"
echo "   Backend bundle: $(test -f dist/index.js && echo "✅ dist/index.js ($(du -h dist/index.js | cut -f1))" || echo "❌ Not built")"
echo "   Frontend assets: $(test -d dist/public && echo "✅ dist/public/ ($(find dist/public -type f | wc -l) files)" || echo "❌ Not built")"

# Check package.json scripts
echo ""
echo "📜 Package.json Configuration:"
grep -A 6 '"scripts"' package.json | head -7

# Environment check
echo ""
echo "🌍 Environment Configuration:"
echo "   PORT: ${PORT:-"Not set (will default to 3000)"}"
echo "   NODE_ENV: ${NODE_ENV:-"Not set (will be set by scripts)"}"

# Deployment readiness
echo ""
if [ -f "dist/index.js" ] && [ -d "dist/public" ]; then
    echo "🎉 DEPLOYMENT STATUS: ✅ READY FOR NODE.JS DEPLOYMENT"
    echo ""
    echo "Deployment commands:"
    echo "   Build: ./deploy-fix.sh"
    echo "   Start: npm start"
    echo "   Test:  NODE_ENV=production node dist/index.js"
else
    echo "⚠️  DEPLOYMENT STATUS: ❌ BUILD REQUIRED"
    echo "   Run: ./deploy-fix.sh"
fi

echo ""
echo "📋 Deployment Summary:"
echo "   • Project Type: Node.js/TypeScript"
echo "   • Framework: Express.js + React"
echo "   • Build Tool: Vite + esbuild"
echo "   • Target Platform: Replit Autoscale"
echo "   • Python files present but NOT used for deployment"