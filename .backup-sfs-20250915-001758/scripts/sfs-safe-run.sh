#!/usr/bin/env bash
# Purpose: run any SFS script with crash-proof debugging and logging
set -euo pipefail
TARGET="${1:-scripts/sfs-quick-fix.sh}"
echo "== Bash =="; bash --version | head -n1 || true; echo
[ -f "$TARGET" ] || { echo "❌ File not found: $TARGET"; exit 2; }
chmod +x "$TARGET" || true
if file "$TARGET" | grep -qi crlf; then perl -pi -e 's/\r\n/\n/g' "$TARGET"; fi
head -n1 "$TARGET" | grep -qE '^#!/usr/bin/env (ba)?sh' || { (echo '#!/usr/bin/env bash'; cat "$TARGET") > "$TARGET.tmp" && mv "$TARGET.tmp" "$TARGET"; chmod +x "$TARGET"; }
set -o errtrace
trap 'c=$?; echo; echo "💥 Crash captured (exit $c)"; echo "Last: $BASH_COMMAND"; env | sed -E "s/(SFS_(TOKEN|API_KEY))=.*/\1=***masked***/"; exit $c' ERR
mask(){ s="$1"; n=${#s}; [ $n -le 8 ] && printf "***" || printf "%s...%s" "${s:0:6}" "${s: -4}"; }
echo "== Env =="; echo "SFS_API_URL=${SFS_API_URL:-<unset>}"; [ -n "${SFS_TOKEN:-}" ] && echo "SFS_TOKEN=$(mask "$SFS_TOKEN")" || echo "SFS_TOKEN=<unset>"; [ -n "${SFS_API_KEY:-}" ] && echo "SFS_API_KEY=$(mask "$SFS_API_KEY")" || echo "SFS_API_KEY=<unset>"; echo
LOG=.sfs_last_run.log
echo "== Running: $TARGET =="; (set -x; "$TARGET") 2>&1 | tee "$LOG"; code=${PIPESTATUS[0]}; echo; echo "== Done (exit $code). Log: $LOG =="; exit "$code"