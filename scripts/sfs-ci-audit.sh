#!/usr/bin/env bash
set -euo pipefail
ts="$(date -u +%Y%m%dT%H%M%SZ)"
out=".sfs/reports/ci-audit-$ts.txt"
repo="smartflow-systems/SmartFlowSite"
api="https://api.github.com"
redact(){ sed -E 's/([A-Za-z0-9_]*_TOKEN|SFS_PAT|GITHUB_TOKEN)=.*/\1=****/g'; }
{
  echo "=== SFS CI Audit @ $ts ==="
  echo "# Git remotes & branch"; git remote -v; git rev-parse --abbrev-ref HEAD

  echo; echo "# Workflows present locally"; ls -1 .github/workflows || true
  echo; echo "# Trigger lines"; grep -RIn "^on:" .github/workflows || true

  echo; echo "# Env snapshot (names only)"; env | awk -F= '{print $1}' | grep -E 'SFS_|REPLIT|GITHUB|NEXT_|STRIPE' | sort

  echo; echo "# Replit git URL format"; git remote get-url origin

  echo; echo "# Token presence checks"
  test -n "${SFS_PAT:-}" && echo "SFS_PAT=SET" || echo "SFS_PAT=MISSING"
  test -n "${SFS_SYNC_URL:-}" && echo "SFS_SYNC_URL=SET" || echo "SFS_SYNC_URL=MISSING"

  if [ -n "${SFS_PAT:-}" ]; then
    echo; echo "# GitHub API: whoami (token scopes visible in headers)"
    curl -sS -H "Authorization: token $SFS_PAT" -D - "$api/user" -o /dev/null | tr -d '\r' | grep -i 'x-oauth-scopes' || echo "No scope header"

    echo; echo "# Repo: actions permissions"
    curl -sS -H "Authorization: token $SFS_PAT" "$api/repos/$repo/actions/permissions" || true

    echo; echo "# Repo: list workflows"
    curl -sS -H "Authorization: token $SFS_PAT" "$api/repos/$repo/actions/workflows" || true

    echo; echo "# Repo: recent workflow runs (last 5)"
    curl -sS -H "Authorization: token $SFS_PAT" "$api/repos/$repo/actions/runs?per_page=5" || true
  else
    echo "⚠️ SFS_PAT not set; cannot query GitHub API."
  fi

  echo; echo "# Default branch (local vs remote)"
  git symbolic-ref --short refs/remotes/origin/HEAD || true
  curl -sS "$api/repos/$repo" | grep -E '"default_branch"|^$' || true

} > "$out"
echo "Report → $out"
