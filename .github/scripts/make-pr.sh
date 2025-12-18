#!/usr/bin/env bash
set -euo pipefail
if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  echo "Usage: $0 [branch] [title] [body_file]  (BASE_BRANCH env, default main)"; exit 0; fi

BRANCH="${1:-chore/sfs-rules}"
TITLE="${2:-chore: SmartFlow rules update}"
BODY_FILE="${3:-}"
BASE="${BASE_BRANCH:-main}"

remote_url="$(git config --get remote.origin.url || true)"
[[ -n "$remote_url" ]] || { echo "No remote 'origin' set."; exit 1; }

# Parse owner/repo from https or ssh
repo="$(printf "%s" "$remote_url" \
 | sed -E 's#^https?://[^/]+/([^/]+)/([^/.]+)(\.git)?$#\1/\2#;t; s#^git@[^:]+:([^/]+)/([^/.]+)(\.git)?$#\1/\2#')"
[[ "$repo" =~ / ]] || { echo "Could not parse repo from $remote_url"; exit 1; }

git checkout -B "$BRANCH"
git push -u origin "$BRANCH"

if [[ -z "$BODY_FILE" ]]; then
  BODY="## Apply-All
(one-block script used)

## Verify
- CI passes
- rules file present

## Undo
\`git reset --hard HEAD~1\`

bundle & apply now?"
else
  BODY="$(cat "$BODY_FILE")"
fi

if command -v gh >/dev/null 2>&1; then
  gh pr create -R "$repo" -B "$BASE" -H "$BRANCH" -t "$TITLE" -b "$BODY" | tee .github/last_pr_url.txt
  exit 0
fi

: "${SFS_PAT:?SFS_PAT token required when gh is not installed}"
api="https://api.github.com/repos/$repo/pulls"
json=$(printf '{"title":"%s","head":"%s","base":"%s","body":"%s"}' \
  "$(printf %s "$TITLE" | sed 's/"/\\"/g')" \
  "$BRANCH" "$BASE" \
  "$(printf %s "$BODY" | sed 's/"/\\"/g' | tr '\n' '\\n')")

resp="$(curl -sS -H "Authorization: token $SFS_PAT" -H "Accept: application/vnd.github+json" -d "$json" "$api")"
url="$(printf "%s" "$resp" | grep -o '"html_url":[^,]*' | head -n1 | cut -d\" -f4 || true)"
[[ -n "$url" ]] && { echo "$url" | tee .github/last_pr_url.txt; exit 0; }
echo "PR create failed:"; echo "$resp"; exit 1
