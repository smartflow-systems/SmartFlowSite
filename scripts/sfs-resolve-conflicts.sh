#!/usr/bin/env bash
set -euo pipefail
: "${CHOICE:=ours}"   # ours|theirs
: "${APPLY:=0}"       # 0=dry-run, 1=write
BK=".sfs-backups/$(date +%Y%m%d-%H%M%S)-conflicts"; mkdir -p "$BK"

if [ ! -s reports/conflicts.txt ]; then
  echo "No reports/conflicts.txt; run scripts/sfs-health.sh first."; exit 0
fi

FILES="$(awk -F: '{print $1}' reports/conflicts.txt | sort -u)"
COUNT=0
for f in $FILES; do
  [ -f "$f" ] || continue
  COUNT=$((COUNT+1))
  python3 - "$f" "$CHOICE" <<'PY'
import re, sys, pathlib
p=pathlib.Path(sys.argv[1]); ch=sys.argv[2]
t=p.read_text(encoding="utf-8",errors="ignore")
pat=re.compile(r"<<<<<<<[^\n]*\n(.*?)\n=======\n(.*?)\n>>>>>>>[^\n]*\n?", re.S)
bs=list(pat.finditer(t))
print(f"{p}: {len(bs)} conflict block(s)")
if not bs: sys.exit(0)
def pick(m): return m.group(1) if ch=="ours" else m.group(2)
open(".sfs-conflict-preview.tmp","w",encoding="utf-8").write(pat.sub(lambda m: pick(m),t))
PY
  if [ "${APPLY}" = "1" ] && [ -f .sfs-conflict-preview.tmp ]; then
    install -D "$f" "$BK/$f"; mv .sfs-conflict-preview.tmp "$f"
  else
    rm -f .sfs-conflict-preview.tmp
  fi
done

if [ "$COUNT" -eq 0 ]; then echo "No files listed."; fi
if [ "${APPLY}" = "1" ]; then
  echo "Backups in $BK"
  git add -A
  git commit -m "fix: resolve conflict markers (choice=${CHOICE})" || echo "Nothing to commit"
else
  echo "Dry-run only. Re-run with APPLY=1 to write."
fi
