#!/usr/bin/env bash
set -euo pipefail

OWNER="${1:-smartflow-systems}"
REPO="${2:-SmartFlowSite}"
REF="${3:-chore/verify-sfs-pat}"
WF_PATH=".github/workflows/verify-sfs-pat.yml"

: "${GITHUB_TOKEN:?Set GITHUB_TOKEN with repo/workflow scope or a PAT}"

echo "Dispatching ${WF_PATH} on ref=${REF} for ${OWNER}/${REPO}…"
curl -sS -X POST \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/verify-sfs-pat.yml/dispatches" \
  -d "{\"ref\":\"${REF}\",\"inputs\":{\"owner\":\"${OWNER}\",\"repo\":\"${REPO}\"}}"

echo "Polling latest workflow run…"
sleep 3
curl -sS \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/verify-sfs-pat.yml/runs?branch=${REF}&per_page=1" \
| jq -r '.workflow_runs[0] | "status=\(.status) conclusion=\(.conclusion // "n/a") url=\(.html_url)"'
