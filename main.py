#!/usr/bin/env python3
"""
SmartFlow Systems - Production Entry Point
Optimized for Replit deployment with proper error handling and fallbacks.
"""
import os
import sys
from pathlib import Path

# Ensure app module is available
BASE = Path(__file__).parent.resolve()
sys.path.insert(0, str(BASE))

try:
    from app import app
    
    if __name__ == "__main__":
        # Force port 5000 for deployment (required by Replit)
        port = int(os.environ.get("PORT", "5000"))
        
        # Production-ready configuration
        app.run(
            host="0.0.0.0", 
            port=port, 
            debug=False,
            threaded=True
        )
        
except Exception as e:
    print(f"Failed to start SmartFlow application: {e}", file=sys.stderr)
    sys.exit(1)