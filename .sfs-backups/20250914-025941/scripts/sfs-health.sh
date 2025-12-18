#!/usr/bin/env bash
set -euo pipefail
echo "SFS Health $(date)"; FAIL=0; mkdir -p reports
test -d .git || { echo "❌ no git"; exit 2; }
echo "branch: $(git rev-parse --abbrev-ref HEAD)"
git remote get-url origin >/dev/null 2>&1 || { echo "❌ no origin"; FAIL=1; }
for f in docs/SmartFlow-Agent-Rules.md .github/workflows; do [ -e "$f" ] || { echo "❌ missing $f"; FAIL=1; }; done
grep -R -n --exclude-dir .git -E '<<<<<<<|>>>>>>>' . > reports/conflicts.txt 2>/dev/null || true
[ -s reports/conflicts.txt ] && { echo "❌ conflicts present"; FAIL=1; }
find . -type f -size +25M -not -path "./.git/*" > reports/large_files.txt || true
[ -s reports/large_files.txt ] && echo "⚠ large files: reports/large_files.txt"
for j in package.json tsconfig.json; do
  [ -f "$j" ] || continue
  python -m json.tool < "$j" >/dev/null 2>&1 || { echo "❌ bad JSON: $j"; FAIL=1; }
done
if [ -f package.json ] && command -v npm >/dev/null 2>&1; then
  npm -s run -l >/dev/null 2>&1 || echo "⚠ no npm scripts"
  npm -s ci --ignore-scripts --dry-run >/dev/null 2>&1 || { echo "❌ npm resolve issues"; FAIL=1; }
fi
find .github/workflows -type f \( -name "*.yml" -o -name "*.yaml" \) | sort > reports/workflows.txt || true
{ echo "FAIL=$FAIL"; echo "workflows:"; cat reports/workflows.txt 2>/dev/null || true
  [ -s reports/conflicts.txt ] && echo "conflicts: reports/conflicts.txt"
  [ -s reports/large_files.txt ] && echo "large_files: reports/large_files.txt"
} > reports/sfs-health.txt
[ "$FAIL" -eq 0 ] && echo "✅ OK (reports/)" || { echo "❌ ISSUES (see reports/)"; exit "$FAIL"; }
