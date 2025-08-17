#!/usr/bin/env python3
"""
Production-ready web server for SmartFlow Portfolio
Serves static files and handles health checks properly for cloud deployment
"""

import http.server
import socketserver
import socket
import os
import sys
import signal
from pathlib import Path

class SmartFlowHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler optimized for deployment health checks"""
    
    def do_GET(self):
        """Handle GET requests with proper health check responses"""
        # Health check endpoint - always respond with 200
        if self.path in ['/', '', '/health']:
            if self.path == '/health':
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Cache-Control', 'no-cache')
                self.end_headers()
                self.wfile.write(b'{"status": "healthy", "service": "smartflow-portfolio"}')
                return
            else:
                # Serve index.html for root path
                self.path = '/index.html'
        
        # Call the parent handler for all other requests
        return super().do_GET()
    
    def do_HEAD(self):
        """Handle HEAD requests for health checks"""
        if self.path in ['/', '', '/health']:
            self.send_response(200)
            self.send_header('Content-type', 'text/html' if self.path in ['/', ''] else 'application/json')
            self.end_headers()
            return
        return super().do_HEAD()
    
    def end_headers(self):
        """Add headers for deployment compatibility"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        # Add deployment-friendly headers
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()
    
    def log_message(self, format, *args):
        """Override to provide cleaner logging for deployment"""
        sys.stdout.write(f"[{self.log_date_time_string()}] {format % args}\n")
        sys.stdout.flush()

def main():
    """Start the production-ready web server"""
    # Get port from environment (required for cloud deployment)
    port = int(os.environ.get('PORT', 5000))
    host = "0.0.0.0"  # Required for cloud deployment
    
    # Change to the directory containing this script
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Verify index.html exists for health checks
    if not (script_dir / 'index.html').exists():
        print("ERROR: index.html not found. Required for deployment health checks.")
        sys.exit(1)
    
    print(f"Starting SmartFlow Portfolio Server...")
    print(f"Server directory: {script_dir}")
    print(f"Serving on: http://{host}:{port}")
    
    # Setup signal handlers for graceful shutdown
    httpd = None
    
    def signal_handler(signum, frame):
        if httpd:
            print(f"\nReceived signal {signum}. Shutting down gracefully...")
            httpd.shutdown()
            httpd.server_close()
        sys.exit(0)
    
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        # Create server with proper socket options for deployment
        httpd = socketserver.TCPServer((host, port), SmartFlowHandler)
        httpd.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        httpd.allow_reuse_address = True
        
        # For cloud deployment, prevent timeout issues
        httpd.timeout = None
        
        print(f"✓ SmartFlow Portfolio Server ready on http://{host}:{port}")
        print("✓ Health check endpoint: /health")
        print("✓ Ready for deployment")
        
        # Serve requests indefinitely
        httpd.serve_forever()
        
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"ERROR: Port {port} is already in use.")
            print("Attempting to kill existing process on port...")
            
            # Try to free up the port
            try:
                import subprocess
                subprocess.run(['pkill', '-f', 'python.*main.py'], check=False)
                subprocess.run(['pkill', '-f', 'python.*server'], check=False)
                
                # Wait a moment for cleanup
                import time
                time.sleep(2)
                
                # Try again on the original port
                httpd = socketserver.TCPServer((host, port), SmartFlowHandler)
                httpd.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                httpd.timeout = None
                print(f"✓ SmartFlow Portfolio Server ready on http://{host}:{port}")
                print("✓ Health check endpoint: /health")
                print("✓ Ready for deployment")
                httpd.serve_forever()
                
            except OSError:
                # If we still can't bind and PORT is set (deployment), exit
                if 'PORT' in os.environ:
                    print("Cannot bind to deployment PORT. Deployment will fail.")
                    sys.exit(1)
                else:
                    # Only attempt alternative ports in development
                    print("Attempting alternative ports for development...")
                    for alt_port in range(5001, 5010):
                        try:
                            httpd = socketserver.TCPServer((host, alt_port), SmartFlowHandler)
                            httpd.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                            print(f"✓ SmartFlow Portfolio Server ready on http://{host}:{alt_port}")
                            httpd.serve_forever()
                            break
                        except OSError:
                            continue
                    else:
                        print("ERROR: No available ports found.")
                        sys.exit(1)
        else:
            print(f"ERROR: Failed to start server: {e}")
            sys.exit(1)
    except Exception as e:
        print(f"ERROR: Unexpected error: {e}")
        sys.exit(1)
    finally:
        if httpd:
            httpd.server_close()

if __name__ == "__main__":
    main()