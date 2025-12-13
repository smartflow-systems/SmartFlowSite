#!/bin/bash
# SmartFlow AI - Replit Deployment Configuration Override
# This script overrides the Python deployment configuration

echo "🔧 SmartFlow AI - Fixing Replit Deployment Configuration"
echo "========================================================"

# Create a deployment helper script that Replit will use
cat > run.sh << 'EOF'
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
EOF

chmod +x run.sh

# Create requirements.txt with minimal content to satisfy Python check but not install anything
echo "# SmartFlow AI is a Node.js application" > requirements.txt
echo "# Python dependencies are not required for deployment" >> requirements.txt

# Create a dummy app.py that redirects to Node.js
cat > app.py << 'EOF'
#!/usr/bin/env python3
"""
SmartFlow AI - Node.js Redirection Script
This application is a Node.js project. This Python file exists only for compatibility.
"""

import subprocess
import sys
import os

print("🔄 SmartFlow AI - Redirecting to Node.js application...")
print("=" * 50)

# Set environment variables
os.environ['NODE_ENV'] = 'production'
os.environ['PORT'] = '3000'

# Execute the Node.js application
try:
    # Check if the build exists
    if not os.path.exists('dist/index.js'):
        print("📦 Building Node.js application...")
        subprocess.run(['./deploy-fix.sh'], check=True)
    
    print("🚀 Starting Node.js server...")
    # Run the Node.js server
    subprocess.run(['node', 'dist/index.js'], check=False)
except KeyboardInterrupt:
    print("\n⏹️  Server stopped")
    sys.exit(0)
except Exception as e:
    print(f"❌ Error: {e}")
    print("Attempting direct Node.js start...")
    subprocess.run(['npm', 'start'])
EOF

echo "✅ Created deployment compatibility files:"
echo "   • run.sh - Node.js runtime script"
echo "   • app.py - Python-to-Node.js redirection"
echo "   • requirements.txt - Empty placeholder"

echo ""
echo "🔄 Testing the deployment setup..."

# Verify the build
if [ ! -f "dist/index.js" ]; then
    echo "📦 Building application first..."
    ./deploy-fix.sh
fi

echo ""
echo "✅ Deployment fix complete!"
echo ""
echo "📋 How the fix works:"
echo "   1. When Replit tries to run 'python3 app.py', it will redirect to Node.js"
echo "   2. The app.py script automatically builds and starts the Node.js server"
echo "   3. Your application runs on port 3000 as a Node.js app"
echo ""
echo "🚀 The deployment should now work correctly!"