#!/usr/bin/env bash
set -euo pipefail

# ========= configuration =========
ORG="smartflow-systems"
REPOS=("SmartFlowSite" "SocialScaleBoosterAIbot" "SFSDataQueryEngine" "SFSAPDemoCRM")
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BRANCH="sfs-power-$TIMESTAMP"
REUSABLE_WORKFLOW="smartflow-systems/SmartFlowSite/.github/workflows/sfs-ci-deploy.yml@main"
# ==================================

# Preflight: ensure signed commits use SSH key
configure_git() {
  git config --global gpg.format ssh
  git config --global commit.gpgsign true
  git config --global user.signingkey "${HOME}/.ssh/id_ed25519" || true
}

check_jq_installed() {
  command -v jq >/dev/null 2>&1 || echo "⚠️  jq not found; package.json script patching will be skipped."
}

mk_readme() { # (OVERWRITE) README.md
  local repository="$1"
  cat > README.md <<MD
<!-- BADGES:START -->
[![SFS CI + Deploy](https://github.com/$ORG/$repository/actions/workflows/ci.yml/badge.svg)](https://github.com/$ORG/$repository/actions/workflows/ci.yml)
<!-- BADGES:END -->

# $repository — SmartFlow Systems
**Dev:** \`npm run dev\`  •  **Prod:** \`npm start\`  
**Health:** \`GET /health\` → \`{"ok":true}\`

## Scripts
- \`dev\` → nodemon/serve
- \`start\` → node server.js (if present)
- \`health\` → bash [scripts/health.sh]

## Replit
Create from GitHub → set secrets \`SFS_PAT\`, \`REPLIT_TOKEN\`, \`SFS_SYNC_URL\`. Port \${PORT:-5000} (or app default).

## CI
Push → GitHub Actions runs reusable CI.

## Agent Notes (see [AGENTS.md])
Show [paths]; VERIFY + UNDO; Bash uses \`set -euo pipefail\`. GitHub = source of truth.
MD
}

configure_git
check_jq_installed

echo "Branch: $BRANCH"
for REPO in "${REPOS[@]}"; do
  echo -e "\n=== $REPO ==="
  if [ -d "$REPO/.git" ]; then
    pushd "$REPO" >/dev/null
  else
    git clone "git@github.com:${ORG}/${REPO}.git" || { echo "❌ clone failed: $REPO"; continue; }
    pushd "$REPO" >/dev/null
  fi

  # Create branch
  git fetch origin --quiet || true
  git switch -c "$BRANCH" 2>/dev/null || git checkout -b "$BRANCH"

  # Backups (best-effort)
  mkdir -p .sfs-backups 2>/dev/null || true
  mkdir -p ".sfs-backups/$BRANCH" 2>/dev/null || true
  for FILE in README.md package.json server.js; do
    [ -f "$FILE" ] && cp -p "$FILE" ".sfs-backups/$BRANCH/" || true
  done

  # AGENTS.md
  cat > AGENTS.md <<'MD'
# AGENTS: SFS Baseline
Where: Shell / Editor / Browser. GitHub is source; Replit mirrors → push back.
Secrets: SFS_PAT, REPLIT_TOKEN, SFS_SYNC_URL (Org→Settings→Secrets→Actions).
Health: GET /health → {"ok":true}. CI must be green.
Rules: show [paths], VERIFY+UNDO, Bash uses set -euo pipefail.
MD

  # scripts/health.sh
  mkdir -p scripts
  cat > scripts/health.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail
BASE="${BASE:-http://127.0.0.1:${PORT:-5000}}"
curl -sS -m 8 -o /dev/null -w "HEALTH:%{http_code}\n" "$BASE/health"
SH
  chmod +x scripts/health.sh

  # Patch package.json scripts if both exist and jq is present
  if [ -f package.json ] && command -v jq >/dev/null 2>&1; then
    TMP_FILE="$(mktemp)"
    jq '.scripts = (.scripts // {}) |
        .scripts.dev     //= "node server.js" |
        .scripts.start   //= "node server.js" |
        .scripts.health  //= "bash scripts/health.sh"' \
      package.json > "$TMP_FILE" && mv "$TMP_FILE" package.json
  fi

  # Add /health if server.js looks like a Node entry
  if [ -f server.js ] && ! grep -q "app.get('/health'" server.js; then
    cat >> server.js <<'JS'

// --- SFS /health (idempotent) ---
const express = require('express'); const cors = require('cors');
const app = module.exports = global._sfs_app || express(); global._sfs_app = app;
app.use(cors()); app.get('/health', (_req,res)=>res.json({ok:true}));
const PORT = process.env.PORT || 5000;
if (!app._sfs_listening){ app._sfs_listening=true; app.listen(PORT,()=>console.log('SFS on',PORT)); }
JS
  fi

  # README overwrite
  mk_readme "$REPO"

  # Reusable CI seeder
  mkdir -p .github/workflows
  cat > .github/workflows/ci.yml <<YAML
name: CI (Reusable SFS)
on:
  push:
    branches: [ "main", "$BRANCH", "dev", "release/**", "hotfix/**" ]
  pull_request:
    branches: [ "main" ]
  workflow_dispatch:

jobs:
  use-reusable:
    uses: $REUSABLE_WORKFLOW
    permissions:
      contents: read
      actions: read
      id-token: write
YAML

  # Commit (signed) & push
  git add AGENTS.md scripts/health.sh README.md .github/workflows/ci.yml 2>/dev/null || true
  [ -f package.json ] && git add package.json || true
  [ -f server.js ] && git add server.js || true

  if git diff --cached --quiet; then
    echo "ℹ️  No staged changes; skipping commit."
  else
    git commit -S -m "chore(sfs): baseline + reusable CI (overwrite README/CI) [$TIMESTAMP]" || true
    git push -u origin "$BRANCH"
  fi

  echo "PR → https://github.com/${ORG}/${REPO}/compare/main...${BRANCH}?expand=1"
  popd >/dev/null
done

echo -e "\n✅ Done. Open each PR link above."