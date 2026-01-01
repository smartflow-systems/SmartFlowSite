#!/usr/bin/env bash
set -euo pipefail
cd /workspace/SmartFlowSite
export TZ=Europe/London
sudo apt-get update -y
sudo apt-get install -y git python3-pip
corepack enable || true
# JS deps: prefer npm if no pnpm lock
if [ -f pnpm-lock.yaml ]; then corepack prepare pnpm@latest --activate || true; pnpm i --frozen-lockfile || pnpm i; else npm ci || npm i; fi
python3 -m pip install -U pip pytest || true
[ -f requirements.txt ] && pip install -r requirements.txt || true
npm -s run lint || true
npm -s test || true
pytest -q || true
echo "✅ Codex ready"