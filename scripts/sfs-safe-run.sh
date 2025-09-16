#!/usr/bin/env bash
# Purpose: run any SFS script with crash-proof debugging and logging
set -euo pipefail
TARGET="${1:-scripts/sfs-quick-fix.sh}"

echo "== Bash =="; bash --version | head -n1 || true; echo

# Ensure target exists
[ -f "$TARGET" ] || { echo "❌ File not found: $TARGET"; exit 2; }

# Make executable
chmod +x "$TARGET" || true

# Fix CRLF if present (no 'file' command needed)
if grep -q $'\r' "$TARGET"; then
  echo "⚠️ Detected CRLF endings in $TARGET. Converting to LF…"
  # Convert in-place without extra tools
  perl -pi -e 's/\r\n/\n/g' "$TARGET"
fi

# Ensure bash shebang
if ! head -n1 "$TARGET" | grep -qE '^#!/usr/bin/env (ba)?sh'; then
  echo "⚠️ Missing/odd shebang. Prepending '#!/usr/bin/env bash'."
  (echo '#!/usr/bin/env bash'; cat "$TARGET") > "$TARGET.tmp" && mv "$TARGET.tmp" "$TARGET"
  chmod +x "$TARGET"
fi

# Trap crashes
set -o errtrace
trap 'c=$?; echo; echo "💥 Crash captured (exit $c)"; echo "Last: $BASH_COMMAND"; echo; echo "Env snapshot (masked):"; env | sed -E "s/(SFS_(TOKEN|API_KEY))=.*/\1=***masked***/"; exit $c' ERR

# Mask helper
mask(){ s="${1:-}"; n=${#s}; [ $n -le 8 ] && printf "***" || printf "%s...%s" "${s:0:6}" "${s: -4}"; }

# Env print
echo "== Env =="
echo "SFS_API_URL=${SFS_API_URL:-<unset>}"
[ -n "${SFS_TOKEN:-}" ]   && echo "SFS_TOKEN=$(mask "$SFS_TOKEN")"   || echo "SFS_TOKEN=<unset>"
[ -n "${SFS_API_KEY:-}" ] && echo "SFS_API_KEY=$(mask "$SFS_API_KEY")" || echo "SFS_API_KEY=<unset>"
echo

LOG=.sfs_last_run.log
echo "== Running: $TARGET =="
(set -x; "$TARGET") 2>&1 | tee "$LOG"
code=${PIPESTATUS[0]}
echo
echo "== Done (exit $code). Log: $LOG =="
exit "$code"
