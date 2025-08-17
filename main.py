#!/usr/bin/env python3
"""
Main entry point for SmartFlow Portfolio deployment
This ensures the server starts correctly for both development and deployment
"""

import os
import sys
from pathlib import Path

# Add the current directory to the Python path
sys.path.insert(0, str(Path(__file__).parent))

# Import and run the server
from server import main

if __name__ == "__main__":
    # Ensure we're in the correct directory
    os.chdir(Path(__file__).parent)
    main()