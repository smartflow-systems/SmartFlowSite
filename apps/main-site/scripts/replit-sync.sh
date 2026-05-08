#!/usr/bin/env bash
set -euo pipefail
BRANCH="${1:-dev}"
MSG="${2:-chore: sync from Replit}"
: "${GH_TOKEN:=${SFS_PAT:-}}"

bash -n "$0"
git rev-parse --git-dir >/dev/null 2>&1 || git init
git config user.name  "${GIT_NAME:-Smartflow Bot}"
git config user.email "${GIT_EMAIL:-bot@smartflow.local}"

if ! git remote get-url origin >/dev/null 2>&1; then
  if [ -n "${REPO_SSH:-}" ]; then
    git remote add origin "$REPO_SSH"
  elif [ -n "${REPO_HTTPS:-}" ]; then
    git remote add origin "$REPO_HTTPS"
  else
    read -p "Enter GitHub repo URL: " URL
    [ -n "$URL" ] && git remote add origin "$URL"
  fi
fi

git fetch origin || true
git checkout -B "$BRANCH"

git add -A
git diff --cached --quiet || git commit -m "$MSG"

# Try normal push first (works if remote is HTTPS and creds cached or SSH key available)
if ! git push -u origin "$BRANCH"; then
  # Fallback: HTTPS with in-memory token
  if [ -n "${GH_TOKEN:-}" ] && [ -n "${GITHUB_USER:-}" ]; then
    echo "⚠️ Falling back to HTTPS token push…"
    if ! git remote get-url origin | grep -q '^https://'; then
      REPO="$(git remote get-url origin | sed -E 's#git@github.com:(.*)\.git#https://github.com/\1.git#')"
      [ -n "$REPO" ] && git remote set-url origin "$REPO"
    fi
    git -c credential.helper='!f() { echo username=$GITHUB_USER; echo password=$GH_TOKEN; }; f' \
      push -u origin "$BRANCH"
  else
    echo "❌ Push failed and no GH_TOKEN/SFS_PAT + GITHUB_USER available."
    exit 2
  fi
fi

echo "✅ Synced to $BRANCH"
