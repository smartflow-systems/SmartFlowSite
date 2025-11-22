#!/usr/bin/env bash
set -Eeuo pipefail
trap 'ec=$?; echo "❌ Error on line $LINENO (exit $ec)"; tail -n 80 "$LOG"; exit $ec' ERR
ts="$(date -u +%Y%m%dT%H%M%SZ)"
LOG=".sfs/reports/diag-run-$ts.log"
{
  echo "=== SFS RUN DIAG @$ts ==="
  echo "# bash version"; bash --version | head -n1
  echo "# shell opts"; set -o
  echo "# cwd"; pwd; echo "# branch"; git rev-parse --abbrev-ref HEAD
  echo "# remotes"; git remote -v
  echo "# node/npm"; node -v || true; npm -v || true
  echo "# curl/jq"; curl --version | head -n1 || true; jq --version || echo "jq: missing (ok)"
  echo "# workflows"; ls -1 .github/workflows || true
  echo "# stray tag-pins"; grep -RIn 'uses: .\+@v[0-9]' .github/workflows || echo "none"
  echo "# .replit (first 30 lines)"; sed -n '1,30p' .replit 2>/dev/null || echo "no .replit"
  echo "# status endpoints (local)"
  curl -sS -w " -> %{http_code}\n" http://localhost:5000/api/health | head -n1 || echo "api/health no local"
  curl -sS -w " -> %{http_code}\n" http://localhost:5000/status | head -n1 || echo "status no local"

  echo "# touch health marker to trigger CI"
  mkdir -p .sfs/health
  echo -e "SFS marker $ts\ncommit=$(git rev-parse --short HEAD)" > ".sfs/health/check-$ts.txt"
  git add ".sfs/health/check-$ts.txt"
  git commit -m "chore: marker $ts" || echo "(no changes?)"
  git push origin HEAD

} | tee "$LOG"
echo "LOG=$LOG"
