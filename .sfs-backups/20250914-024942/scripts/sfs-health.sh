#!/usr/bin/env bash
set -euo pipefail
echo "🧪 SFS Health — $(date)"
FAIL=0; mkdir -p reports

# Repo & git
test -d .git || { echo "❌ not a git repo"; exit 2; }
git rev-parse --abbrev-ref HEAD | xargs -I{} echo "• branch: {}"
git remote get-url origin >/dev/null 2>&1 && echo "• origin set" || { echo "❌ no origin"; FAIL=1; }

# Key files
for f in docs/SmartFlow-Agent-Rules.md .github/workflows; do
  [ -e "$f" ] && echo "• found $f" || { echo "❌ missing $f"; FAIL=1; }
done

# Merge-conflict markers
if grep -R -n --exclude-dir .git -E '<<<<<<<|>>>>>>>' . >/tmp/sfs_conflicts.txt 2>/dev/null; then
  echo "❌ conflict markers present"; FAIL=1
  cp /tmp/sfs_conflicts.txt reports/conflicts.txt || true
fi

# Large files (25MB+)
find . -type f -size +25M -not -path "./.git/*" > reports/large_files.txt || true
[ -s reports/large_files.txt ] && { echo "⚠️ large files detected"; } || echo "• no large files"

# JSON sanity
for j in package.json tsconfig.json .replit; do
  [ -f "$j" ] || continue
  case "$j" in
    .replit) echo "• skip JSON check for .replit";;
    *) python -m json.tool < "$j" >/dev/null 2>&1 && echo "• $j OK" || { echo "❌ bad JSON in $j"; FAIL=1; } ;;
  esac
done

# Node/npm quick checks (if present)
if [ -f package.json ]; then
  node -v >/dev/null 2>&1 && npm -v >/dev/null 2>&1 || echo "⚠️ node/npm missing (skipping npm checks)"
  if command -v npm >/dev/null 2>&1; then
    npm -s run -l >/dev/null 2>&1 || echo "⚠️ no npm scripts"
    npm -s ci --ignore-scripts --dry-run >/dev/null 2>&1 && echo "• deps resolvable (dry-run)" || { echo "❌ npm install issues"; FAIL=1; }
  fi
fi

# YAML presence (best-effort)
find .github/workflows -type f -name "*.yml" -o -name "*.yaml" > reports/workflows.txt 2>/dev/null || true

# Outcome
echo "— results in reports/sfs-health.txt —"
{
  echo "SFS Health Summary @ $(date)"
  echo "FAIL=$FAIL"
  echo "branch=$(git rev-parse --abbrev-ref HEAD)"
  echo "origin=$(git remote get-url origin 2>/dev/null || echo 'none')"
  echo "workflows:"; cat reports/workflows.txt 2>/dev/null || true
  [ -s reports/conflicts.txt ] && echo "conflicts: see reports/conflicts.txt"
  [ -s reports/large_files.txt ] && echo "large_files: see reports/large_files.txt"
} > reports/sfs-health.txt
exit $FAIL
