#!/usr/bin/env bash
set -euo pipefail
GH_ORG=smartflow-systems
GH_REPO=SmartFlowSite
MSG="${MSG:-chore: quick save $(date -u +%FT%TZ)}"

# 1) Try to read PAT from env (Replit secrets expose env vars)
PAT="${SFS_PAT:-${GH_PAT:-${GITHUB_TOKEN:-${GITHUB_PAT:-}}}}"
if [ -z "${PAT}" ]; then
  read -r -p "Paste GitHub PAT (hidden): " -s PAT; echo
fi

# 2) Git identity & remote
git config user.name  "Gareth (SmartFlow)"
git config user.email "gareth+smartflow@users.noreply.github.com"
git remote remove origin 2>/dev/null || true
git remote add origin "https://${USER:-gareth}:${PAT}@github.com/${GH_ORG}/${GH_REPO}.git"

# 3) Commit & push, then clean the remote (no token stored)
git add -A; git commit -m "$MSG" || true
git push -u origin main
git remote set-url origin "https://github.com/${GH_ORG}/${GH_REPO}.git"
unset PAT
echo "✅ Pushed to https://github.com/${GH_ORG}/${GH_REPO} (branch: main)"
