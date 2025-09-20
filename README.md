<p align="center">
<!-- BADGES:START -->
[![SFS CI + Deploy](https://github.com/smartflow-systems/SmartFlowSite/actions/workflows/ci.yml/badge.svg)](https://github.com/smartflow-systems/SmartFlowSite/actions/workflows/ci.yml)
[![CodeQL](https://github.com/smartflow-systems/SmartFlowSite/actions/workflows/codeql.yml/badge.svg)](https://github.com/smartflow-systems/SmartFlowSite/actions/workflows/codeql.yml)
[![Release](https://img.shields.io/github/v/release/smartflow-systems/SmartFlowSite?display_name=tag&sort=semver)](https://github.com/smartflow-systems/SmartFlowSite/releases)
[![SmartFlow Tools Lint](https://github.com/smartflow-systems/SmartFlowSite/actions/workflows/sf-shellcheck.yml/badge.svg)](https://github.com/smartflow-systems/SmartFlowSite/actions/workflows/sf-shellcheck.yml)
[![Sync Labels](https://github.com/smartflow-systems/SmartFlowSite/actions/workflows/labels-sync.yml/badge.svg)](https://github.com/smartflow-systems/SmartFlowSite/actions/workflows/labels-sync.yml)
<!-- BADGES:END -->
</p>

# SmartFlowSite — SmartFlow Systems

#!/usr/bin/env bash
set -euo pipefail

ORG="smartflow-systems"
REPOS=("SmartFlowSite" "SocialScaleBoosterAIbot" "SFSDataQueryEngine" "SFSAPDemoCRM")
TS="$(date -u +%Y%m%dT%H%M%SZ)"
BR="sfs-power-$TS"
REUSABLE="smartflow-systems/SmartFlowSite/.github/workflows/sfs-ci-deploy.yml@main"

mk_readme(){ # (OVERWRITE) [README.md]
  local repo="$1" wf="https://github.com/$ORG/$repo/actions"
  cat > README.md <<MD
<!-- BADGES:START -->
[![SFS CI + Deploy](https://github.com/$ORG/$repo/actions/workflows/ci.yml/badge.svg)](https://github.com/$ORG/$repo/actions/workflows/ci.yml)
<!-- BADGES:END -->

# $repo — SmartFlow Systems
**Dev:** \`npm run dev\`  •  **Prod:** \`npm start\`  
**Health:** \`GET /health\` → \`{"ok":true}\`

## Scripts
- \`dev\` → nodemon/serve
- \`start\` → node server.js (if present)
- \`health\` → bash [scripts/health.sh]

## Replit
Create from GitHub → set secrets \`SFS_PAT\`, \`REPLIT_TOKEN\`, \`SFS_SYNC_URL\`. Port \${PORT:-5000} (or app default).

## CI
Push → GitHub Actions runs reusable CI. $wf

## Agent Notes (see [AGENTS.md])
Show [paths]; VERIFY + UNDO; Bash uses \`set -euo pipefail\`. GitHub = source of truth.
MD
}

for R in "${REPOS[@]}"; do
  echo "=== $R ==="
  if [ -d "$R/.git" ]; then pushd "$R" >/dev/null
  else git clone "https://github.com/$ORG/$R.git"; pushd "$R" >/dev/null; fi

  git fetch origin
  git switch -c "$BR" || git checkout -b "$BR"

  # Backup
  mkdir -p .sfs-backups && cp -r README.md package.json server.js ".sfs-backups/$BR" 2>/dev/null || true

  # [AGENTS.md]
  cat > AGENTS.md <<'MD'
# AGENTS: SFS Baseline
Where: Shell / Editor / Browser. GitHub is source; Replit mirrors → push back.
Secrets: SFS_PAT, REPLIT_TOKEN, SFS_SYNC_URL (Org→Settings→Secrets→Actions).
Health: GET /health → {"ok":true}. CI must be green.
Rules: show [paths], VERIFY+UNDO, Bash uses set -euo pipefail.
MD

  # [scripts/health.sh]
  mkdir -p scripts
  cat > scripts/health.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail
BASE="${BASE:-http://127.0.0.1:${PORT:-5000}}"
curl -sS -m 8 -o /dev/null -w "HEALTH:%{http_code}\n" "$BASE/health"
SH
  chmod +x scripts/health.sh

  # Ensure npm scripts if package.json exists
  if [ -f package.json ] && command -v jq >/dev/null 2>&1; then
    T="$(mktemp)"
    jq '.scripts.dev? //= "node server.js"
       | .scripts.start? //= "node server.js"
       | .scripts.health? //= "bash scripts/health.sh"' package.json > "$T" && mv "$T" package.json
  fi

  # Add /health to Node repos
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

  # (OVERWRITE) README
  mk_readme "$R"

  # Reusable CI seeder (OVERWRITE) [.github/workflows/ci.yml]
  mkdir -p .github/workflows
  cat > .github/workflows/ci.yml <<YAML
name: CI (Reusable SFS)

on:
  push:
    branches: [ "main", "$BR", "dev", "release/**", "hotfix/**" ]
  pull_request:
    branches: [ "main" ]

jobs:
  use-reusable:
    uses: $REUSABLE
    permissions:
      contents: read
      id-token: write
      actions: read
YAML

  git add AGENTS.md scripts/health.sh package.json server.js README.md .github/workflows/ci.yml 2>/dev/null || true
  git commit -m "chore(sfs): power baseline + reusable CI (OVERWRITE readme/ci)" || true
  git push -u origin "$BR"
  echo "PR: https://github.com/$ORG/$R/pull/new/$BR"
  popd >/dev/null
done

echo "✅ POWER MASTER pushed. Review PRs above."