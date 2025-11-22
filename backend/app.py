#!/usr/bin/env python3
"""
SmartFlowSite Backend - Production Flask API with Security
Implements secure /data route with Path.relative_to() protection and CORS
"""

from pathlib import Path
from flask import Flask, abort, send_from_directory, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
BASE = Path(__file__).parent.resolve()

# Configure CORS for SmartFlowSite frontend domains
CORS(app, origins=[
    "https://your-smartflowsite.repl.co",  # Production domain
    "http://localhost:5000",               # Dev frontend
    "http://localhost:3000",               # Alt dev port
])

# Create data directory if it doesn't exist
(BASE / "data").mkdir(exist_ok=True)

@app.route("/status")
def status():
    """Status endpoint for frontend monitoring"""
    return jsonify({
        "ok": True,
        "service": "SFS-Backend", 
        "backend": "flask",
        "data_endpoint": "secured"
    })

@app.route("/health")
def health():
    """Health check endpoint"""
    return jsonify({"ok": True})

@app.route("/data/<path:fname>")
def data_files(fname: str):
    """
    Secure file serving with path traversal protection using Path.relative_to()
    
    Security Features:
    - resolve(strict=True): Fails immediately on missing files (prevents race conditions)  
    - relative_to(): Mathematical validation prevents ../../../etc/passwd attacks
    - Proper HTTP codes: 404 for missing files, 403 for traversal attempts
    - File type restrictions: Only allow safe extensions
    """
    data_root = BASE / "data"
    
    try:
        # Security: resolve with strict=True catches missing files early
        p = (data_root / fname).resolve(strict=True)
        
        # Security: Mathematical validation prevents path traversal
        p.relative_to(data_root)  # raises ValueError if outside data/
        
    except FileNotFoundError:
        # File doesn't exist - return 404
        abort(404)
    except ValueError:
        # Path traversal attempt blocked - return 403  
        abort(403)
    
    # Additional security: restrict file types
    if p.suffix not in {".json", ".csv", ".txt", ".md"}:
        abort(403)
    
    return send_from_directory(p.parent, p.name)

@app.errorhandler(403)
def forbidden(error):
    """Handle forbidden access attempts"""
    return jsonify({"error": "Access forbidden", "code": 403}), 403

@app.errorhandler(404) 
def not_found(error):
    """Handle not found errors"""
    return jsonify({"error": "File not found", "code": 404}), 404

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)