from __future__ import annotations
from flask import Flask, send_from_directory, jsonify, request, Response, abort
from pathlib import Path
from datetime import timedelta
from email.message import EmailMessage
import os, json, base64, csv, io, smtplib

BASE = Path(__file__).parent.resolve()
app = Flask(__name__, static_url_path="", static_folder=str(BASE))

# --- utils ---

def load_json(path: Path, fallback=None):
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return fallback


def _basic_auth_ok(req) -> bool:
    user_env = os.getenv("ADMIN_USER", "admin")
    pass_env = os.getenv("ADMIN_PASSWORD", "")
    if not pass_env:
        return False
    auth = req.headers.get("Authorization", "")
    if not auth.startswith("Basic "):
        return False
    try:
        raw = base64.b64decode(auth.split(" ", 1)[1]).decode("utf-8")
        user, pwd = raw.split(":", 1)
        return (user == user_env) and (pwd == pass_env)
    except Exception:
        return False


def _require_admin():
    return Response("Auth required", 401, {"WWW-Authenticate": 'Basic realm="SmartFlow Admin"'})


# --- caching ---
@app.after_request
def add_caching(resp):
    if resp.mimetype == "text/html":
        resp.cache_control.no_cache = True
    else:
        resp.cache_control.public = True
        resp.cache_control.max_age = int(timedelta(days=7).total_seconds())
    resp.headers.setdefault("Access-Control-Allow-Origin", "*")
    return resp


# --- routes ---
@app.get("/")
def root():
    idx = BASE / "index.html"
    if idx.exists():
        return send_from_directory(BASE, "index.html")
    return Response("OK", 200, {"Content-Type": "text/plain; charset=utf-8"})


@app.get("/health")
def health():
    return jsonify({"ok": True})


@app.get("/status")
def status():
    exists = {f: (BASE / f).exists() for f in [
        "index.html","styles.css","app.js","site.config.json","pricing.json"
    ]}
    return jsonify({
        "ok": True,
        "cwd": str(BASE),
        "port_env": os.getenv("PORT"),
        "files": exists
    })


@app.route("/data/<path:name>")
def data_files(name: str):
    p = BASE / "data" / name
    if not p.exists():
        abort(404)
    return send_from_directory(p.parent, p.name)


@app.post("/lead")
def lead():
    payload = request.get_json(silent=True) or {}
    name = str(payload.get("name", "")).strip()
    email = str(payload.get("email", "")).strip()
    if not name or "@" not in email:
        return jsonify({"ok": False, "error": "invalid"}), 400

    payload.setdefault("ts", __import__("datetime").datetime.utcnow().isoformat(timespec="seconds") + "Z")

    out = BASE / "data" / "leads.jsonl"
    out.parent.mkdir(exist_ok=True)
    with out.open("a", encoding="utf-8") as f:
        f.write(json.dumps(payload, ensure_ascii=False) + "\n")

    host = os.getenv("SMTP_HOST", "")
    to_addr = os.getenv("SMTP_TO", "")
    if host and to_addr:
        try:
            msg = EmailMessage()
            msg["Subject"] = f"New Lead: {name} ({payload.get('plan') or 'undecided'})"
            msg["From"] = os.getenv("SMTP_FROM", to_addr)
            msg["To"] = to_addr
            body = "\n".join(
                f"{k}: {payload.get(k,'')}" for k in ("name","email","business","plan","goal","page","ts")
            )
            msg.set_content(body)
            port = int(os.getenv("SMTP_PORT", "587"))
            user = os.getenv("SMTP_USER", "")
            pwd = os.getenv("SMTP_PASS", "")
            with smtplib.SMTP(host, port, timeout=10) as s:
                s.starttls()
                if user and pwd:
                    s.login(user, pwd)
                s.send_message(msg)
        except Exception:
            pass

    return jsonify({"ok": True})


@app.get("/admin/leads")
def admin_leads():
    if not _basic_auth_ok(request):
        return _require_admin()

    src = BASE / "data" / "leads.jsonl"
    leads = []
    if src.exists():
        with src.open("r", encoding="utf-8") as f:
            for line in f:
                try:
                    leads.append(json.loads(line))
                except Exception:
                    continue
    leads.sort(key=lambda x: x.get("ts",""), reverse=True)

    rows = "\n".join(
        f"<tr><td>{i+1}</td><td>{l.get('ts','')}</td><td>{l.get('name','')}</td>"
        f"<td>{l.get('email','')}</td><td>{l.get('business','')}</td>"
        f"<td>{l.get('plan','')}</td><td>{(l.get('goal','') or '')[:120]}</td>"
        f"<td><a href='{l.get('page','')}' target='_blank' rel='noopener'>link</a></td></tr>"
        for i,l in enumerate(leads)
    )

    html = f"""<!doctype html><html><head><meta charset='utf-8'/><meta name='viewport' content='width=device-width,initial-scale=1'/>
    <title>Leads — Admin</title><link rel='stylesheet' href='/styles.css'/><style>
    table{{width:100%;border-collapse:collapse}}th,td{{border:1px solid #2b2722;padding:8px;text-align:left}}
    thead th{{background:#14110f}}.wrap{{width:min(1200px,92%);margin:20px auto}}
    </style></head><body><div class='wrap'><h1>Leads ({len(leads)})</h1>
    <p><a class='btn btn-gold' href='/admin/leads.csv'>Download CSV</a></p>
    <table><thead><tr><th>#</th><th>ts</th><th>name</th><th>email</th><th>business</th><th>plan</th><th>goal</th><th>page</th></tr></thead>
    <tbody>{rows or '<tr><td colspan=8>No leads yet.</td></tr>'}</tbody></table></div></body></html>"""
    return Response(html, 200, {"Content-Type":"text/html; charset=utf-8"})


@app.get("/admin/leads.csv")
def admin_leads_csv():
    if not _basic_auth_ok(request):
        return _require_admin()

    src = BASE / "data" / "leads.jsonl"
    leads = []
    if src.exists():
        with src.open("r", encoding="utf-8") as f:
            for line in f:
                try:
                    leads.append(json.loads(line))
                except Exception:
                    continue

    buf = io.StringIO()
    fields = ["ts","name","email","business","plan","goal","page"]
    w = csv.DictWriter(buf, fieldnames=fields); w.writeheader()
    for l in leads: w.writerow({k:l.get(k,"") for k in fields})

    return Response(buf.getvalue(), 200, {
        "Content-Type":"text/csv; charset=utf-8",
        "Content-Disposition":"attachment; filename=leads.csv"
    })


# Keep the original CSV endpoints for backward compatibility
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

    # Also call the main lead endpoint for consistency
    payload = {"name": name, "email": email, "message": message}
    
    # Store in both CSV and JSONL formats
    leads_csv = BASE / "data.csv"
    if not leads_csv.exists():
        leads_csv.write_text("timestamp,name,email,message\n", encoding="utf-8")
    
    with leads_csv.open("a", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        from datetime import datetime
        w.writerow([datetime.utcnow().isoformat(), name, email, message])

    return jsonify({"ok": True, "saved": True})

@app.get("/api/leads")
def api_leads():
    leads_path = BASE / "data.csv"
    if not leads_path.exists():
        leads_path.write_text("timestamp,name,email,message\n", encoding="utf-8")
    
    rows = []
    with leads_path.open("r", encoding="utf-8") as f:
        r = csv.DictReader(f)
        rows = list(r)
    return jsonify({"ok": True, "rows": rows})


@app.route("/<path:path>")
def static_proxy(path: str):
    return send_from_directory(BASE, path)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=False)