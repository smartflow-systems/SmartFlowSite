#!/usr/bin/env bash
set -euo pipefail
: "${GH_TOKEN:=${SFS_PAT:-}}"

missing=()
[ -n "${OPENAI_API_KEY:-}" ] || missing+=("OPENAI_API_KEY")
[ -n "${GH_TOKEN:-}" ] || missing+=("GH_TOKEN (or SFS_PAT)")
[ -n "${GITHUB_USER:-}" ] || missing+=("GITHUB_USER")

echo "▶ Secrets snapshot:"
for k in OPENAI_API_KEY GH_TOKEN SFS_PAT GITHUB_USER REPO_HTTPS REPO_SSH REPLIT_TOKEN SFS_SYNC_URL SYNC_TOKEN; do
  v="$(eval echo \${$k:+set})"; printf "  %-12s %s\n" "$k" "${v:-missing}";
done

if [ ${#missing[@]} -gt 0 ]; then
  echo "❌ Missing: ${missing[*]}"; exit 1;
fi
echo "✅ Secrets look good."
