#!/usr/bin/env bash
set -Eeuo pipefail
trap 'echo "❌ Failed at line $LINENO"; exit 1' ERR

LOG="verify-push-$(date -u +%Y%m%dT%H%M%SZ).log"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
FILES=( ".github/workflows/sfs-ci-deploy.yml" "app.py" "index.html" )

echo "== 🔎 Verifying on branch: $BRANCH ==" | tee "$LOG"
printf -- "Files:\n- %s\n" "${FILES[@]}" | tee -a "$LOG"

echo "1) Checking for merge conflict markers…" | tee -a "$LOG"
if grep -R -nE '<<<<<<<|=======|>>>>>>>' -- "${FILES[@]}" | tee -a "$LOG"; then
  echo "❌ Conflict markers found above. Fix and re-run." | tee -a "$LOG"
  exit 1
else
  echo "✅ No conflict markers" | tee -a "$LOG"
fi

echo "2) Python syntax check (app.py)..." | tee -a "$LOG"
python -m py_compile app.py && echo "✅ app.py compiles" | tee -a "$LOG"

echo "3) YAML sanity (.github/workflows/sfs-ci-deploy.yml)..." | tee -a "$LOG"
python - <<'PY' | tee -a "$LOG"
import sys, subprocess
try:
  import yaml
except Exception:
  subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "PyYAML"])
  import yaml
with open(".github/workflows/sfs-ci-deploy.yml","r",encoding="utf-8") as f:
  yaml.safe_load(f)
print("✅ YAML valid")
PY

echo "4) HTML checks (index.html)..." | tee -a "$LOG"
grep -q '<meta charset="utf-8"' index.html && echo "✅ utf-8 meta present" | tee -a "$LOG" || { echo "❌ missing utf-8 meta" | tee -a "$LOG"; exit 1; }
if grep -qE 'â€”|Â£' index.html; then
  echo "❌ Bad encoding chars (â€”/Â£) still present" | tee -a "$LOG"; exit 1;
else
  echo "✅ encoding clean" | tee -a "$LOG"
fi
grep -q 'id="latest-list"' index.html && echo "✅ latest-list container present" | tee -a "$LOG" || { echo "❌ missing #latest-list" | tee -a "$LOG"; exit 1; }

echo "5) Diff summary (unstaged)..." | tee -a "$LOG"
git --no-pager diff --stat "${FILES[@]}" | tee -a "$LOG" || true

if git diff --quiet -- "${FILES[@]}"; then
  echo "ℹ️  No changes to commit. Skipping commit/push." | tee -a "$LOG"
else
  echo "6) Stage, SIGN, commit, push..." | tee -a "$LOG"
  git add "${FILES[@]}"
  git commit -S -m "ci/ui/api: resolve conflicts + validate (signed)" | tee -a "$LOG"
  git push -u origin "$BRANCH" | tee -a "$LOG"
fi

echo "== ✅ All checks passed =="$'\n'"Log saved: $LOG" | tee -a "$LOG"
echo "PR → https://github.com/smartflow-systems/SmartFlowSite/compare/main...$BRANCH?expand=1"
