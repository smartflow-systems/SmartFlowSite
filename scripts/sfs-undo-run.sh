set -euo pipefail
pkill -f "node server.js" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "tsx watch" 2>/dev/null || true
echo "Stopped (best-effort)."
