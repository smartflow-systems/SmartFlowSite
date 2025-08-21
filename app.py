from __future__ import annotations
from flask import Flask, send_from_directory, jsonify, request, Response
from pathlib import Path
from datetime import timedelta
import csv, json, os

BASE = Path(__file__).parent.resolve()
app = Flask(__name__, static_url_path="", static_folder=str(BASE))

def load_json(path: Path, fallback=None):
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return fallback

def ensure_csv(path: Path):
    if not path.exists():
        path.write_text("timestamp,name,email,message\n", encoding="utf-8")

@app.after_request
def add_headers(resp: Response):
    # Cache: HTML no-cache, assets 7 days
    if resp.mimetype == "text/html":
        resp.cache_control.no_cache = True
    else:
        resp.cache_control.public = True
        resp.cache_control.max_age = int(timedelta(days=7).total_seconds())
    # Basic CORS for simple demos
    resp.headers.setdefault("Access-Control-Allow-Origin", "*")
    resp.headers.setdefault("Access-Control-Allow-Headers", "Content-Type")
    return resp

@app.route("/")
def index():
    return send_from_directory(BASE, "index.html")

@app.get("/health")
def health():
    cfg = load_json(BASE / "site.config.json", {})
    return jsonify({"ok": True, "configLoaded": bool(cfg)})

@app.get("/api/config")
def api_config():
    cfg = load_json(BASE / "site.config.json", {})
    return jsonify(cfg or {})

@app.post("/api/lead")
def api_lead():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    message = (data.get("message") or "").strip()
    if not name or not email:
        return jsonify({"ok": False, "error": "name and email are required"}), 400

    leads_path = BASE / "data.csv"
    ensure_csv(leads_path)
    with leads_path.open("a", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        from datetime import datetime
        w.writerow([datetime.utcnow().isoformat(), name, email, message])

    return jsonify({"ok": True, "saved": True})

@app.get("/api/leads")
def api_leads():
    leads_path = BASE / "data.csv"
    ensure_csv(leads_path)
    rows = []
    with leads_path.open("r", encoding="utf-8") as f:
        r = csv.DictReader(f)
        rows = list(r)
    return jsonify({"ok": True, "rows": rows})

@app.route("/<path:path>")
def static_proxy(path: str):
    return send_from_directory(BASE, path)

if __name__ == "__main__":
    port = int(os.getenv("PORT", "3000"))
    app.run(host="0.0.0.0", port=port, debug=False)