#!/usr/bin/env bash
set -euo pipefail
echo "🔎 SFS Orchestrator quick status check"
ROOT="${1:-.}"
cd "$ROOT"
if [ ! -f "package.json" ] || [ ! -d ".sfs" ]; then
  echo "❌ Not in SmartFlowSite root. cd into the repo and retry."; exit 1; fi
HEALTH_URL="http://localhost:5001/health"
echo -n "⏱  Checking health at ${HEALTH_URL} ... "
if curl -fsS "${HEALTH_URL}" >/tmp/sfs_health.json 2>/dev/null; then
  echo "OK"
  if command -v jq >/dev/null 2>&1; then
    jq -r '.service as $s | .ok as $ok | .agents as $a? | .packages as $p? | "  Service: \($s) • ok=\($ok) • agents=\($a // "n/a") • packages=\($p // "n/a")"' /tmp/sfs_health.json || true
  else
    cat /tmp/sfs_health.json
  fi
else
  echo "UNREACHABLE"; echo "👉 Start it: npm run orchestrator"
fi
echo "🧰 CLI status:"; npm run agent -- status || true
echo "📦 Packages (CLI):"; npm run agent -- package list || true
echo "🤖 Agents (CLI):"; npm run agent -- agent list || true
echo "📡 Active workflows (API):"
curl -sS http://localhost:5001/api/workflows/active | (jq . 2>/dev/null || cat) || true
echo "✅ Status complete."
