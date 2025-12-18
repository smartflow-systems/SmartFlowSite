#!/usr/bin/env bash
set -euo pipefail
PORT=${PORT:-5000}
echo "Health:"; curl -fsS "http://localhost:$PORT/health"; echo
echo "Root HEAD:"; curl -sI "http://localhost:$PORT/" | head -n1
if [ -n "${DEV_PROXY_TARGET:-}" ]; then
  echo "Status via proxy:"; curl -fsS "http://localhost:$PORT/status" | head -n1 || true
else
  echo "Set DEV_PROXY_TARGET to test /status proxy."
fi
