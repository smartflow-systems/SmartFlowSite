#!/usr/bin/env bash
set -euo pipefail
: "${CHOICE:=ours}"   # ours|theirs (which side to keep)
: "${APPLY:=0}"       # 0=dry-run preview, 1=write changes
BK=".sfs-backups/$(date +%Y%m%d-%H%M%S)-conflicts"; mkdir -p "$BK"

# Need a conflict list (grep -n style) in reports/conflicts.txt
if [ ! -s reports/conflicts.txt ]; then
  echo "No reports/conflicts.txt; run scripts/sfs-health.sh first."; exit 0
fi

FILES="$(awk -F: '{print $1}' reports/conflicts.txt | sort -u)"
COUNT=0
for f in $FILES; do
  [ -f "$f" ] || continue
  COUNT=$((COUNT+1))
  python3 - "$f" "$CHOICE" <<'PY'
import re, sys, pathlib, shutil, tempfile
path = pathlib.Path(sys.argv[1]); choice = sys.argv[2]
try:
    data = path.read_text(encoding="utf-8", errors="ignore")
except Exception as e:
    print(f"{path}: read error {e}"); sys.exit(0)
pat = re.compile(r"<<<<<<<[^\n]*\n(.*?)\n=======\n(.*?)\n>>>>>>>[^\n]*\n?", re.S)
blocks = list(pat.finditer(data))
print(f"{path}: {len(blocks)} conflict block(s)")
if not blocks:
    sys.exit(0)
def pick(m): return m.group(1) if choice=="ours" else m.group(2)
new = pat.sub(lambda m: pick(m), data)
open(".sfs-conflict-preview.tmp","w",encoding="utf-8").write(new)
PY
  if [ "${APPLY}" = "1" ] && [ -f .sfs-conflict-preview.tmp ]; then
    install -D "$f" "$BK/$f"
    mv .sfs-conflict-preview.tmp "$f"
  else
    rm -f .sfs-conflict-preview.tmp
  fi
done

if [ "$COUNT" -eq 0 ]; then echo "No files listed in reports/conflicts.txt"; fi
if [ "${APPLY}" = "1" ]; then
  echo "Backups saved in $BK"
  git add -A
  git commit -m "fix: resolve conflict markers (choice=${CHOICE})" || echo "Nothing to commit"
else
  echo "Dry-run only. Re-run with APPLY=1 to write."
fi
