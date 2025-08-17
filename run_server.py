#!/usr/bin/env python3
"""Simple server runner for deployment"""

import os
import sys
from pathlib import Path

# Ensure we're in the correct directory
app_dir = Path(__file__).parent
os.chdir(app_dir)

# Add current directory to Python path
sys.path.insert(0, str(app_dir))

print("Starting SmartFlow Portfolio Server...")

# Import and start the server directly
try:
    from server import main as server_main
    server_main()
except Exception as e:
    print(f"Server error: {e}")
    sys.exit(1)