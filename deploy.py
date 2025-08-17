#!/usr/bin/env python3
"""
Clean deployment entry point for SmartFlow Portfolio
Ensures proper port handling and deployment readiness
"""

import os
import sys
import http.server
import socketserver
from pathlib import Path

class DeploymentHandler(http.server.SimpleHTTPRequestHandler):
    """Deployment-optimized HTTP handler"""
    
    def do_GET(self):
        if self.path in ['/', '']:
            self.path = '/index.html'
        elif self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "healthy", "service": "smartflow-portfolio"}')
            return
        return super().do_GET()
    
    def do_HEAD(self):
        if self.path in ['/', '', '/health']:
            self.send_response(200)
            self.send_header('Content-type', 'text/html' if self.path != '/health' else 'application/json')
            self.end_headers()
            return
        return super().do_HEAD()

def main():
    port = int(os.environ.get('PORT', 5000))
    host = "0.0.0.0"
    
    # Ensure we're in the right directory
    os.chdir(Path(__file__).parent)
    
    # Verify required files exist
    if not Path('index.html').exists():
        print("ERROR: index.html not found")
        sys.exit(1)
    
    try:
        # Create server
        with socketserver.TCPServer((host, port), DeploymentHandler) as httpd:
            httpd.allow_reuse_address = True
            print(f"✓ SmartFlow Portfolio serving on http://{host}:{port}")
            print("✓ Ready for deployment")
            httpd.serve_forever()
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()