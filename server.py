from flask import Flask, request, jsonify
app = Flask(__name__)

@app.get("/health")
def health():
    return jsonify(ok=True), 200

@app.post("/api/gh-sync")
def gh_sync():
    payload = request.get_json(silent=True) or {}
    print("🔔 gh-sync:", {k: payload.get(k) for k in ("event","repo","sha")})
    return jsonify(received=True), 200

if __name__ == "__main__":
    import os
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))