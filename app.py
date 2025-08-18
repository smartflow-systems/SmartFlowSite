from __future__ import annotations
import os, time
from pathlib import Path
from flask import Flask, jsonify, send_from_directory, Response, request

BASE_DIR = Path(__file__).resolve().parent
PUBLIC_DIRS = ["", "assets", "static", "blog", "attached_assets"]
START_TIME = time.time()
REQUEST_COUNT = 0

def create_app() -> Flask:
    app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="")

    @app.before_request
    def count_request():
        global REQUEST_COUNT
        REQUEST_COUNT += 1

    @app.get("/")
    def root() -> Response:
        index = BASE_DIR / "index.html"
        if index.exists():
            return send_from_directory(index.parent, index.name, mimetype="text/html")
        return Response("OK", 200, mimetype="text/plain")

    @app.get("/health")
    def health():
        uptime = round(time.time() - START_TIME, 3)
        return jsonify({"status": "ok", "uptime_sec": uptime}), 200

    @app.get("/ready")
    def ready():
        return jsonify({"ready": True}), 200

    @app.get("/metrics")
    def metrics() -> Response:
        uptime = round(time.time() - START_TIME, 3)
        body = (
            "# HELP smartflow_requests_total Total HTTP requests\n"
            "# TYPE smartflow_requests_total counter\n"
            f"smartflow_requests_total {REQUEST_COUNT}\n"
            "# HELP smartflow_uptime_seconds Uptime in seconds\n"
            "# TYPE smartflow_uptime_seconds gauge\n"
            f"smartflow_uptime_seconds {uptime}\n"
        )
        return Response(body, mimetype="text/plain")

    for folder in PUBLIC_DIRS:
        folder_path = (BASE_DIR / folder).resolve()
        def make_handler(folder_name: str, folder_path: Path):
            def handler(path: str) -> Response:
                target = (folder_path / path).resolve()
                if folder_path in target.parents or target == folder_path:
                    return send_from_directory(str(folder_path), path)
                return jsonify({"error": "Not Found"}), 404
            handler.__name__ = f"serve_{folder_name or 'root'}"
            return handler
        route_prefix = f"/{folder}" if folder else ""
        app.add_url_rule(f"{route_prefix}/<path:path>", view_func=make_handler(folder or "root", folder_path))

    @app.errorhandler(404)
    def not_found(_err):
        return jsonify({"error": "Not Found", "path": request.path}), 404

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port)