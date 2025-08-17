#!/usr/bin/env python3
"""
Simple web server for SmartFlow Portfolio
Serves static files and handles health checks properly for deployment
"""

import http.server
import socketserver
import socket
import os
import sys
from pathlib import Path

class SmartFlowHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler that ensures proper responses for health checks"""
    
    def do_GET(self):
        """Handle GET requests with proper health check responses"""
        # Ensure the root path returns index.html with 200 status
        if self.path == '/' or self.path == '':
            self.path = '/index.html'
        
        # Call the parent handler
        return super().do_GET()
    
    def end_headers(self):
        """Add CORS headers for development"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    """Start the web server"""
    port = int(os.environ.get('PORT', 5000))
    
    # Change to the directory containing this script
    os.chdir(Path(__file__).parent)
    
    # Try to bind to the port with SO_REUSEADDR
    try:
        httpd = socketserver.TCPServer(("0.0.0.0", port), SmartFlowHandler)
        httpd.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        
        print(f"SmartFlow Portfolio Server running on http://0.0.0.0:{port}")
        print("Press Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
        finally:
            httpd.shutdown()
            httpd.server_close()
            
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"Error: Port {port} is already in use.")
            print("Trying alternative ports...")
            for alt_port in range(5001, 5010):
                try:
                    httpd = socketserver.TCPServer(("0.0.0.0", alt_port), SmartFlowHandler)
                    httpd.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                    print(f"SmartFlow Portfolio Server running on http://0.0.0.0:{alt_port}")
                    print("Press Ctrl+C to stop the server")
                    httpd.serve_forever()
                    break
                except OSError:
                    continue
            else:
                print("Could not find an available port. Please try again later.")
                sys.exit(1)
        else:
            raise

if __name__ == "__main__":
    main()