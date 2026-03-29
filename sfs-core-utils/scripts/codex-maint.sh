#!/usr/bin/env bash
set -euo pipefail
cd /workspace/SmartFlowSite
export TZ=Europe/London
corepack enable || true
if [ -f pnpm-lock.yaml ]; then corepack prepare pnpm@latest --activate || true; pnpm i --frozen-lockfile || pnpm i; else npm ci || npm i; fi
python3 -m pip install -U pip pytest || true
[ -f requirements.txt ] && pip install -r requirements.txt || true
# Optional webhook (only if URL responds OK)
if [ -n "${SFS_SYNC_URL:-}" ] && curl -fsI "$SFS_SYNC_URL" >/dev/null 2>&1; then
  curl -fsS -X POST "$SFS_SYNC_URL" -d '{"event":"codex-setup"}' || true
else
  echo "ℹ️ Skip sync webhook (unset or not reachable)"
fi
npm -s test || true
pytest -q || true
echo "✅ Codex ready"