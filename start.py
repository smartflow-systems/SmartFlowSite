#!/usr/bin/env python3
"""
Simple production entry point for deployment platforms
Ensures compatibility with various cloud deployment services
"""

import os
import sys
from pathlib import Path

# Ensure we're in the correct directory
app_dir = Path(__file__).parent
os.chdir(app_dir)
sys.path.insert(0, str(app_dir))

# Simple validation
required_files = ['index.html', 'server.py']
for file_name in required_files:
    if not (app_dir / file_name).exists():
        print(f"ERROR: Missing required file: {file_name}")
        sys.exit(1)

print("✓ SmartFlow Portfolio starting...")
print(f"✓ Working directory: {app_dir}")
print(f"✓ Port: {os.getenv('PORT', '5000')}")

# Start the Flask server
try:
    from server import main
    main()
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)