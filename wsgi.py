#!/usr/bin/env python3
"""
WSGI entry point for production deployment
Optimized for Replit cloud hosting
"""

import os
import sys
from pathlib import Path

# Ensure we're in the correct directory
app_dir = Path(__file__).parent
os.chdir(app_dir)
sys.path.insert(0, str(app_dir))

# Import the application
from server import app_factory

# Create the application instance
application = app_factory()

if __name__ == "__main__":
    # For development/testing
    port = int(os.environ.get('PORT', 5000))
    application.run(host='0.0.0.0', port=port, debug=False)