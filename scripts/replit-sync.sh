#!/usr/bin/env bash
set -euo pipefail

BRANCH="${1:-dev}"
MSG="${2:-chore: sync from Replit}"

# Self syntax-check
bash -n "$0"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  git init
fi

git config user.name "Smartflow Bot"
git config user.email "bot@smartflow.local"

if ! git remote get-url origin >/dev/null 2>&1; then
  read -p "Enter GitHub repo URL (e.g. git@github.com:boweazy/SmartFlowSite.git): " URL
  [ -n "$URL" ] && git remote add origin "$URL"
fi

git fetch origin || true
git checkout -B "$BRANCH"

git add -A
if ! git diff --cached --quiet; then
  git commit -m "$MSG"
else
  echo "No changes to commit"
fi

git push -u origin "$BRANCH"
echo "✅ Synced to $BRANCH"
