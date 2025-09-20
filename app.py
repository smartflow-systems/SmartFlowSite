from __future__ import annotations
from flask import Flask, send_from_directory, jsonify, request, abort
from pathlib import Path
from datetime import timedelta
import smtplib, json, os
from email.message import EmailMessage

BASE = Path(__file__).parent.resolve()
app = Flask(__name__, static_url_path="", static_folder=str(BASE))

def load_json(path: Path, fallback=None):
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return fallback

@app.after_request
def add_caching(resp):
    # Why: HTML fresh, assets cached
    if resp.mimetype == "text/html":
        resp.cache_control.no_cache = True
    else:
        resp.cache_control.public = True
        resp.cache_control.max_age = int(timedelta(days=7).total_seconds())
    resp.headers.setdefault("Access-Control-Allow-Origin", "*")
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
    p = BASE / "data" / fname
    if not p.exists():
        abort(404)
    return send_from_directory(p.parent, p.name)

@app.post("/lead")
def lead():
    """Receive lead as JSON, store to /data/leads.jsonl, optionally email."""
    payload = request.get_json(silent=True) or {}
    name = str(payload.get("name", "")).strip()
    email = str(payload.get("email", "")).strip()
    if not name or "@" not in email:  # minimal validation
        return jsonify({"ok": False, "error": "invalid"}), 400
    payload["ts"] = payload.get("ts") or __import__("datetime").datetime.utcnow().isoformat() + "Z"

    # Store
    out = BASE / "data" / "leads.jsonl"
    out.parent.mkdir(exist_ok=True)
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
    return send_from_directory(BASE, path)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    app.run(host="0.0.0.0", port=port, debug=False)