import os
from pathlib import Path
from flask import Flask, send_from_directory, jsonify

def main():
    static_folder = str(Path(__file__).parent)
    app = Flask(__name__, static_folder=static_folder)

    @app.route("/")
    def root():
        return send_from_directory(static_folder, "index.html")

    @app.route("/health")
    def health():
        return jsonify({"status": "healthy", "service": "smartflow-portfolio"}), 200

    @app.route("/<path:filename>")
    def assets(filename):
        return send_from_directory(static_folder, filename)

    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

if __name__ == "__main__":
    main()