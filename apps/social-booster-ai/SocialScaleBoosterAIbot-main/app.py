#!/usr/bin/env python3
"""
SmartFlow AI - Node.js Application Launcher
This is a Node.js/TypeScript application. This Python script handles deployment compatibility.
"""

import subprocess
import sys
import os
import signal

def signal_handler(sig, frame):
    print("\nShutting down gracefully...")
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

print("SmartFlow AI - Starting Node.js Application")
print("=" * 45)

# Set production environment
os.environ['NODE_ENV'] = 'production'
os.environ['PORT'] = '3000'

try:
    # Check if build exists, if not, build it
    if not os.path.exists('dist/index.js'):
        print("Building application...")
        build_result = subprocess.run(['npm', 'run', 'build'], check=True, capture_output=True, text=True)
        print("Build completed successfully")
    
    print("Starting Node.js server on port 3000...")
    # Start the Node.js application
    process = subprocess.run(['npm', 'start'], check=False)
    
except FileNotFoundError:
    print("Node.js not found. Trying alternative approach...")
    try:
        subprocess.run(['node', 'dist/index.js'], check=False)
    except Exception as fallback_error:
        print(f"Failed to start server: {fallback_error}")
        sys.exit(1)
        
except subprocess.CalledProcessError as e:
    print(f"Build failed: {e}")
    print("Attempting to start with existing build...")
    try:
        subprocess.run(['node', 'dist/index.js'], check=False)
    except:
        sys.exit(1)
        
except Exception as e:
    print(f"Unexpected error: {e}")
    sys.exit(1)

# WSGI application for gunicorn compatibility
def application(environ, start_response):
    """WSGI application that serves a redirect message to Node.js server"""
    status = '200 OK'
    headers = [
        ('Content-Type', 'text/html'),
        ('Location', 'http://localhost:3000')
    ]
    start_response(status, headers)
    
    html_response = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>SmartFlow AI</title>
        <meta http-equiv="refresh" content="0;url=http://localhost:3000">
    </head>
    <body>
        <h1>SmartFlow AI</h1>
        <p>Redirecting to Node.js application...</p>
        <p><a href="http://localhost:3000">Click here if not redirected automatically</a></p>
        <script>window.location.href = 'http://localhost:3000';</script>
    </body>
    </html>
    """
    return [html_response.encode('utf-8')]

# Gunicorn expects an 'app' variable
app = application
