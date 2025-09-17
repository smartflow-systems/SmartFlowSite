#!/usr/bin/env bash
set -euo pipefail
: "${THRESHOLD_MB:=25}"
: "${LFS:=0}" # 1 = add non-destructive LFS patterns
echo "🔎 Files >= ${THRESHOLD_MB}MB"
find . -type f -size +"${THRESHOLD_MB}"M -not -path "./.git/*" -printf "%p\t%k KB\n" | sort -k2 -nr \
  | tee reports/large_files.txt || true
if [ "${LFS}" = "1" ]; then
  { echo "*.png filter=lfs diff=lfs merge=lfs -text"
    echo "*.jpg filter=lfs diff=lfs merge=lfs -text"
    echo "*.zip filter=lfs diff=lfs merge=lfs -text"
    echo "*.mp4 filter=lfs diff=lfs merge=lfs -text"; } >> .gitattributes
  git add .gitattributes && git commit -m "chore: suggest Git LFS patterns" || true
  echo "Note: enable LFS in repo settings and run 'git lfs install' locally."
fi
