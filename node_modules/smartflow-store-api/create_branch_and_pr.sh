#!/usr/bin/env bash
set -euo pipefail

# Enter repo
for d in "$HOME/workspace/SmartFlowSite" "$HOME/SmartFlowSite" "$PWD"; do
  [ -d "$d/.git" ] && { cd "$d"; break; }
done; git rev-parse --is-inside-work-tree >/dev/null

# Auth
command -v gh >/dev/null || nix-env -iA nixpkgs.gh >/dev/null
: "${SFS_PAT:?Add SFS_PAT in Replit → Tools → Secrets (Actions)}"
echo "$SFS_PAT" | gh auth login --with-token
gh auth status -h github.com >/dev/null

# Repo + branch
url="$(git remote get-url origin)"
read OWNER REPO <<<"$(echo "$url" | sed -E 's#.*github.com[:/]{1}([^/]+)/([^/.]+)(\.git)?#\1 \2#')"
SLUG="${OWNER}/${REPO}"
BR="ops/hook-stabilize-$(date +%Y%m%d%H%M%S)"
echo "$BR" > /tmp/sfs_last_branch.txt
git switch -c "$BR"

# Hooks: use scripts/git-hooks; keep your existing hook scripts
git config --local core.hooksPath scripts/git-hooks
mkdir -p scripts/git-hooks
chmod +x scripts/git-hooks/* 2>/dev/null || true
rm -f pre-commit pre-push  # remove stray root-level copies

# Commit only if changes exist
git add -A
git diff --cached --quiet || git commit -m "chore(hooks): set core.hooksPath=scripts/git-hooks; ensure +x; remove stray root hooks"

# Push + PR
git push -u origin "$BR"
gh pr create -R "$SLUG" --title "Stabilize Git hooks path"   --body "Points hooks to scripts/git-hooks, ensures +x, removes stray root hooks. Keeps your existing scripts."

# VERIFY
echo "---- VERIFY ----"
git config --show-origin core.hooksPath || true
ls -l scripts/git-hooks | sed -n '1,20p'
echo "PR URL:"; gh pr view -R "$SLUG" --json url -q .url
