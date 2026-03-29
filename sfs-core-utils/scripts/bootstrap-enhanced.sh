#!/usr/bin/env bash
set -euo pipefail
bash -n "$0"

if [ -f package.json ]; then
  echo "📦 Installing Node deps..."
  npm ci || npm install
fi

if [ -f requirements.txt ]; then
  echo "🐍 Installing Python deps..."
  python -m pip install --upgrade pip
  pip install -r requirements.txt
fi

if ! git rev-parse --git-dir >/dev/null 2>&1; then git init; fi
echo "✅ Bootstrap done"
