import os
import sys
from pathlib import Path
from flask import Flask, send_from_directory, jsonify, request

def app_factory():
    """Create and configure the Flask application"""
    static_folder = str(Path(__file__).parent)
    app = Flask(__name__, static_folder=static_folder)

    @app.route("/")
    def root():
        """Serve the main index.html page"""
        try:
            return send_from_directory(static_folder, "index.html")
        except Exception as e:
            print(f"Error serving index.html: {e}")
            return "SmartFlow Systems Portfolio", 200

    @app.route("/health")
    def health():
        """Health check endpoint for deployment"""
        return jsonify({
            "status": "healthy", 
            "service": "smartflow-portfolio",
            "version": "1.0.0"
        }), 200

    @app.route("/healthz")
    def healthz():
        """Alternative health check endpoint"""
        return "OK", 200

    @app.route("/<path:filename>")
    def assets(filename):
        """Serve static assets"""
        try:
            return send_from_directory(static_folder, filename)
        except Exception as e:
            print(f"Error serving {filename}: {e}")
            return "File not found", 404

    return app

def main():
    """Main entry point for development server"""
    app = app_factory()
    
    # Configure for deployment
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    
    print(f"Starting SmartFlow Portfolio server on port {port}")
    print(f"Static folder: {app.static_folder}")
    print(f"Debug mode: {debug}")
    
    try:
        app.run(
            host="0.0.0.0", 
            port=port, 
            debug=debug,
            threaded=True
        )
    except Exception as e:
        print(f"Server startup error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()