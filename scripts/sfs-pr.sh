#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   scripts/sfs-pr.sh "type: message" [branch-slug]
# Example:
#   scripts/sfs-pr.sh "chore: update theme tokens" theme-tokens

MSG="${1:-}"
SLUG="${2:-}"

if [ -z "$MSG" ]; then
  echo "Usage: scripts/sfs-pr.sh \"type: message\" [branch-slug]"
  exit 1
fi

# branch slug auto
if [ -z "$SLUG" ]; then
  SLUG="$(echo "$MSG" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g')"
fi

STAMP="$(date +%Y%m%dT%H%M%S)"
BR="pr/${SLUG}-${STAMP}"

TOKEN="${SFS_PAT:?Set SFS_PAT in Replit Secrets}"
REPO="smartflow-systems/SmartFlowSite"

cd /home/runner/workspace/SmartFlowSite

git rev-parse --is-inside-work-tree >/dev/null
git fetch origin --prune

# Ensure main is current
git checkout main
git pull --ff-only origin main

# Create branch
git checkout -b "$BR"

# Commit changes (if any)
git add -A
if git diff --cached --quiet; then
  echo "No changes to commit."
  exit 0
fi
git commit -m "$MSG"

# Push with PAT
git remote set-url origin "https://${TOKEN}@github.com/${REPO}.git"
git push -u origin "$BR"
git remote set-url origin "https://github.com/${REPO}.git"

# Open PR (best-effort; if gh not logged in, prints link)
if command -v gh >/dev/null 2>&1; then
  gh pr create --repo "$REPO" --base main --head "$BR" --title "$MSG" --body "Automated PR via scripts/sfs-pr.sh"
  echo "PR created."
else
  echo "gh not available. Create PR manually from branch: $BR"
  echo "Repo: https://github.com/${REPO}"
fi

echo "DONE: $BR"
