#!/usr/bin/env bash
set -euo pipefail
: "${THRESHOLD_MB:=25}"
: "${INCLUDE_NODE_MODULES:=0}"  # set to 1 to include node_modules in scan (off by default)

# Build an exclusion set
EXCLUDES='-not -path "./.git/*" -a -not -path "./.sfs-backups/*" -a -not -path "./reports/*" -a -not -path "./build/*" -a -not -path "./dist/*" -a -not -path "./.next/*" -a -not -path "./.vercel/*"'
if [ "${INCLUDE_NODE_MODULES}" != "1" ]; then
  EXCLUDES="${EXCLUDES} -a -not -path \"./node_modules/*\""
fi

# shellcheck disable=SC2086
eval "find . -type f -size +${THRESHOLD_MB}M ${EXCLUDES} -printf '%p\t%k KB\n' | sort -k2 -nr" > reports/large_files.txt || true

[ -s reports/large_files.txt ] && echo "⚠ large files detected (reports/large_files.txt)" || echo "• no large files (threshold ${THRESHOLD_MB}MB)"
