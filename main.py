#!/usr/bin/env python3
"""
Production entry point for SmartFlow Portfolio
Optimized for cloud deployment with proper error handling and logging
"""

import os
import sys
import traceback
from pathlib import Path

def main():
    """Main application entry point with deployment optimizations"""
    try:
        # Ensure we're in the correct directory
        app_dir = Path(__file__).parent
        os.chdir(app_dir)
        
        # Add current directory to Python path
        sys.path.insert(0, str(app_dir))
        
        # Validate deployment requirements
        required_files = ['index.html', 'server.py', 'styles.css', 'app.js']
        missing_files = []
        
        for file_name in required_files:
            if not (app_dir / file_name).exists():
                missing_files.append(file_name)
        
        if missing_files:
            print(f"DEPLOYMENT ERROR: Missing required files: {', '.join(missing_files)}")
            print("Ensure all static assets are present for deployment.")
            sys.exit(1)
        
        # Import and start the server
        print("Starting SmartFlow Portfolio for deployment...")
        print("✓ All required files present")
        print("✓ Flask server initializing...")
        from server import main as server_main
        server_main()
        
    except ImportError as e:
        print(f"DEPLOYMENT ERROR: Failed to import server module: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"DEPLOYMENT ERROR: Unexpected error during startup: {e}")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()