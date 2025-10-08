#!/usr/bin/env bash
set -euo pipefail
ORG="smartflow-systems"; REPO="SmartFlowSite"; TOKEN="${GH_TOKEN:-${SFS_PAT:-}}"
[ -n "${TOKEN:-}" ] || { echo "Set GH_TOKEN or SFS_PAT"; exit 1; }
curl -s -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
 "https://api.github.com/repos/$ORG/$REPO/code-scanning/alerts?per_page=20" | \
  jq -r '.[] | "- [" + .rule.id + "] " + .state + " → " + .html_url'
