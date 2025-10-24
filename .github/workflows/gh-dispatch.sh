#!/usr/bin/env bash
set -euo pipefail
OWNER="${1:?owner (e.g. smartflow-systems)}"
REPO="${2:?repo (e.g. SmartFlowSite)}"
REF="${3:?ref/branch (e.g. chore/verify-sfs-pat)}"
WF_FILE="${4:-verify-sfs-pat.yml}"
: "${GITHUB_TOKEN:?Set GITHUB_TOKEN first}"
WF_PATH=".github/workflows/${WF_FILE}"
echo "• Sanity: OWNER=${OWNER} REPO=${REPO} REF=${REF} WF_PATH=${WF_PATH}"
test -f "${WF_PATH}" || { echo "Missing ${WF_PATH} in your checkout"; exit 1; }
echo "• Dispatching ${WF_PATH} on ref=${REF}…"
curl -sS -X POST \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WF_FILE}/dispatches" \
  -d "{\"ref\":\"${REF}\",\"inputs\":{\"owner\":\"${OWNER}\",\"repo\":\"${REPO}\"}}"
echo "• Polling latest run url…"
curl -sS \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WF_FILE}/runs?branch=${REF}&per_page=1"
echo
