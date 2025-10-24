#!/usr/bin/env bash
set -euo pipefail
OWNER="${1:-smartflow-systems}"
REPO="${2:-SmartFlowSite}"
REF="${3:-chore/verify-sfs-pat}"
WF_FILE="verify-sfs-pat.yml"
: "${GITHUB_TOKEN:?Set GITHUB_TOKEN (a PAT with repo/workflow) before running.}"
echo "Dispatching .github/workflows/${WF_FILE} on ref=${REF} for ${OWNER}/${REPO}…"
curl -sS -X POST \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WF_FILE}/dispatches" \
  -d "{\"ref\":\"${REF}\",\"inputs\":{\"owner\":\"${OWNER}\",\"repo\":\"${REPO}\"}}"
echo "✔ Dispatched. Open: https://github.com/${OWNER}/${REPO}/actions/workflows/${WF_FILE}"
echo
echo "Polling latest run metadata…"
curl -sS \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WF_FILE}/runs?branch=${REF}&per_page=1"
echo
