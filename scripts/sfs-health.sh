#!/usr/bin/env bash
set -euo pipefail
echo "SFS Health $(date)"; FAIL=0; mkdir -p reports
test -d .git || { echo "❌ no git"; exit 2; }
echo "branch: $(git rev-parse --abbrev-ref HEAD)"
git remote get-url origin >/dev/null 2>&1 || { echo "❌ no origin"; FAIL=1; }
for f in docs/SmartFlow-Agent-Rules.md .github/workflows; do [ -e "$f" ] || { echo "❌ missing $f"; FAIL=1; }; done
grep -R -n -E '<<<<<<<|>>>>>>>' . \
  --binary-files=without-match \
  --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=.sfs-backups \
  --exclude-dir=reports --exclude-dir=build --exclude-dir=dist \
  --exclude-dir=.next --exclude-dir=.vercel --exclude-dir=public \
  --exclude-dir=scripts \
  > reports/conflicts.txt 2>/dev/null || true
[ -s reports/conflicts.txt ] && { echo "❌ conflict markers present"; FAIL=1; } || echo "• no conflict markers"
bash scripts/sfs-large-files.sh >/dev/null 2>&1 || true
for j in package.json tsconfig.json; do [ -f "$j" ] && python -m json.tool < "$j" >/dev/null 2>&1 || true; done
find .github/workflows -type f \( -name "*.yml" -o -name "*.yaml" \) | sort > reports/workflows.txt || true
{ echo "FAIL=$FAIL"; echo "workflows:"; cat reports/workflows.txt 2>/dev/null || true
  [ -s reports/conflicts.txt ] && echo "conflicts: see reports/conflicts.txt"
  [ -s reports/large_files.txt ] && echo "large_files: see reports/large_files.txt"; } > reports/sfs-health.txt
[ "$FAIL" -eq 0 ] && echo "✅ OK (see reports/)" || { echo "❌ ISSUES (see reports/)"; exit "$FAIL"; }
