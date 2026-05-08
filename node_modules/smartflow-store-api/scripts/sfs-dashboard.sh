#!/usr/bin/env bash
set -euo pipefail
ORG="${ORG:-smartflow-systems}"
REPOS=(${REPOS:-SmartFlowSite SocialScaleBoosterAIbot SFSDataQueryEngine SFSAPDemoCRM})
BR_PREFIX="${BR_PREFIX:-sfs-power}"
TOKEN="${SFS_PAT:-${GITHUB_TOKEN:-}}"
api() { curl -sS -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" "$@"; }
line() { printf '%s\n' "────────────────────────────────────────"; }

for R in "${REPOS[@]}"; do
  line
  echo "🔧 $R"
  # Find the newest branch that starts with BR_PREFIX
  BR=$(api "https://api.github.com/repos/$ORG/$R/branches?per_page=100" | jq -r ".[].name" | grep "^$BR_PREFIX" | head -n1 || true)
  echo "Branch: ${BR:-<none>}"

  # PR for that branch
  if [ -n "${BR:-}" ]; then
    PR=$(api "https://api.github.com/repos/$ORG/$R/pulls?head=$ORG:$BR&state=all" | jq -r '.[0].html_url // empty')
  fi
  echo "PR: ${PR:-<none>}"

  # Latest workflow run (any) on that branch
  if [ -n "${BR:-}" ]; then
    RUN=$(api "https://api.github.com/repos/$ORG/$R/actions/runs?branch=$BR&per_page=1")
    STATUS=$(echo "$RUN" | jq -r '.workflow_runs[0].status // empty')
    CONC=$(echo "$RUN" | jq -r '.workflow_runs[0].conclusion // empty')
    RUNURL=$(echo "$RUN" | jq -r '.workflow_runs[0].html_url // empty')
  fi
  echo "CI: ${STATUS:-<no run>} ${CONC:-}  ${RUNURL:-}"
done
line
