from __future__ import annotations
from flask import Flask, send_from_directory, jsonify, request, abort, safe_join
from pathlib import Path
from datetime import timedelta
import smtplib, json, os
import urllib.parse
from email.message import EmailMessage

BASE = Path(__file__).parent.resolve()
app = Flask(__name__, static_url_path="", static_folder=str(BASE))

def load_json(path: Path, fallback=None):
    try:
        if not path.exists():
            return fallback
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return fallback

@app.after_request
def add_caching(resp):
    # Why: HTML fresh, assets cached
    if resp.mimetype == "text/html":
        resp.cache_control.no_cache = True
    else:
        resp.cache_control.public = True
        resp.cache_control.max_age = int(timedelta(days=7).total_seconds())

    # Security: Configure CORS with allowed origins from environment
    allowed_origin = os.getenv("CORS_ORIGIN", "http://localhost:3000")
    resp.headers.setdefault("Access-Control-Allow-Origin", allowed_origin)
    return resp

@app.route("/")
def index():
    return send_from_directory(BASE, "index.html")

@app.get("/health")
def health():
    cfg = load_json(BASE / "site.config.json", {})
    site_name = cfg.get("siteName", "SmartFlow Systems") if cfg else "SmartFlow Systems"
    return jsonify({"ok": True, "site": site_name})

@app.route("/data/<path:fname>")
def data_files(fname: str):
    # Security: prevent path traversal using Flask's safe_join
    # safe_join returns None if the path tries to escape the directory
    safe_path = safe_join(str(BASE / "data"), fname)
    if safe_path is None:
        abort(403)

    # Check if file exists
    if not Path(safe_path).is_file():
        abort(404)

    return send_from_directory(BASE / "data", fname)

@app.post("/lead")
def lead():
    """Receive lead as JSON, store to /data/leads.jsonl, optionally email."""
    payload = request.get_json(silent=True) or {}
    name = str(payload.get("name", "")).strip()
    email = str(payload.get("email", "")).strip()
    if not name or "@" not in email:  # minimal validation
        return jsonify({"ok": False, "error": "invalid"}), 400
    payload["ts"] = payload.get("ts") or __import__("datetime").datetime.utcnow().isoformat() + "Z"

    # Ensure data directory exists
    data_dir = BASE / "data"
    data_dir.mkdir(exist_ok=True)
    
    # Store
    out = data_dir / "leads.jsonl"
    with out.open("a", encoding="utf-8") as f:
        f.write(json.dumps(payload, ensure_ascii=False) + "\n")

    # Optional email
    host = os.getenv("SMTP_HOST", "")
    to_addr = os.getenv("SMTP_TO", "")
    if host and to_addr:
        try:
            msg = EmailMessage()
            msg["Subject"] = f"New Lead: {name} ({payload.get('plan') or 'undecided'})"
            msg["From"] = os.getenv("SMTP_FROM", to_addr)
            msg["To"] = to_addr
            body = "\n".join([f"{k}: {payload.get(k,'')}" for k in ("name","email","business","plan","goal","page","ts")])
            msg.set_content(body)
            port = int(os.getenv("SMTP_PORT", "587"))
            user = os.getenv("SMTP_USER", "")
            pwd = os.getenv("SMTP_PASS", "")
            with smtplib.SMTP(host, port, timeout=10) as s:
                s.starttls()
                if user and pwd: s.login(user, pwd)
                s.send_message(msg)
        except Exception:
            pass  # Why: never block user on email issues

    return jsonify({"ok": True})

@app.route("/<path:path>")
def static_proxy(path: str):
    # Decode percent-encoded characters to prevent traversal via encoded payloads
    decoded_path = urllib.parse.unquote(path)

    # Security: prevent path traversal using Flask's safe_join
    # safe_join returns None if the path tries to escape the directory
    safe_path = safe_join(str(BASE), decoded_path)
    if safe_path is None:
        abort(403)

    try:
        return send_from_directory(BASE, decoded_path)
    except Exception:
        # If file not found, return 404
        abort(404)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=False)