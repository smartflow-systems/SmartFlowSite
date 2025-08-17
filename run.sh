#!/bin/bash
# Production deployment script for SmartFlow Portfolio

echo "Starting SmartFlow Portfolio for deployment..."

# Ensure Python dependencies are available
python3 -c "import flask" 2>/dev/null || {
    echo "ERROR: Flask not found. Installing dependencies..."
    pip3 install flask pillow
}

# Start the server
exec python3 main.py