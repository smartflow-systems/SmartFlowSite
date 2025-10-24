set -euo pipefail; test -d .git || { echo "Run inside your repo clone."; exit 1; }; git status --porcelain; WORK_BRANCH="chore/verify-sfs-pat"; git config --global --unset-all credential.helper || true; git config --global credential.helper store; git checkout "$WORK_BRANCH"; test -f .github/workflows/verify-sfs-pat.yml || { echo "Workflow file missing; aborting."; exit 1; }; mkdir -p .github/workflows; cat > .github/workflows/gh-dispatch.sh <<'BASH' #!/usr/bin/env bash set -euo pipefail OWNER="\${1:?owner (e.g. smartflow-systems)}" REPO="\${2:?repo (e.g. SmartFlowSite)}" REF="\${3:?ref/branch (e.g. chore/verify-sfs-pat)}" WF_FILE="\${4:-verify-sfs-pat.yml}" : "\${GITHUB_TOKEN:?Set GITHUB_TOKEN first}" WF_PATH=".github/workflows/\${WF_FILE}" echo "• Sanity: OWNER=\${OWNER} REPO=\${REPO} REF=\${REF} WF_PATH=\${WF_PATH}" test -f "\${WF_PATH}" || { echo "Missing \${WF_PATH} in your checkout"; exit 1; } echo "• Dispatching \${WF_PATH} on ref=\${REF}…" curl -sS -X POST \ -H "Authorization: Bearer \${GITHUB_TOKEN}" \ -H "Accept: application/vnd.github+json" \ "https://api.github.com/repos/\${OWNER}/\${REPO}/actions/workflows/\${WF_FILE}/dispatches" \ -d "{\"ref\":\"\${REF}\",\"inputs\":{\"owner\":\"\${OWNER}\",\"repo\":\"\${REPO}\"}}" echo "• Polling latest run url…" curl -sS \ -H "Authorization: Bearer \${GITHUB_TOKEN}" \ -H "Accept: application/vnd.github+json" \ "https://api.github.com/repos/\${OWNER}/\${REPO}/actions/workflows/\${WF_FILE}/runs?branch=\${REF}&per_page=1" echo BASH chmod +x .github/workflows/gh-dispatch.sh; git add .github/workflows/gh-dispatch.sh; git commit -m "chore: solid API dispatcher (arg-checked, safe defaults)" || true; git push -u origin "$WORK_BRANCH"; if [ -n "${SFS_PAT:-}" ] && [ -z "${GITHUB_TOKEN:-}" ]; then export GITHUB_TOKEN="$SFS_PAT"; fi; : "${GITHUB_TOKEN:?Export GITHUB_TOKEN or SFS_PAT first}"; .github/workflows/gh-dispatch.sh smartflow-systems SmartFlowSite "$WORK_BRANCH" verify-sfs-pat.yml
set -euo pipefail

# 0) Preconditions
test -d .git || { echo "Run inside your repo clone."; exit 1; }
git status --porcelain

WORK_BRANCH="chore/verify-sfs-pat"

# 1) Quiet the credential helper noise (gh isn't installed in Replit)
git config --global --unset-all credential.helper || true
git config --global credential.helper store

# 2) Ensure the workflow file is present
git checkout "$WORK_BRANCH"
test -f .github/workflows/verify-sfs-pat.yml || { echo "Workflow file missing; aborting."; exit 1; }

# 3) Install/update the API dispatcher helper
mkdir -p .github/workflows
cat > .github/workflows/gh-dispatch.sh <<'BASH'
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
