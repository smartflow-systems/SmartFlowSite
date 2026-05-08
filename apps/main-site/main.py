from flask import Flask, request, jsonify
import os
app = Flask(__name__)

@app.get("/health")
def health():
    return "ok"

@app.post("/gh-sync")
def gh_sync():
    if request.headers.get("Authorization","") != f"Bearer {os.environ.get('REPLIT_TOKEN','')}":
        return ("nope", 401)
    data = request.get_json(silent=True) or {}
    print("[SFS] Deploy", data)
    return jsonify(status="ok")