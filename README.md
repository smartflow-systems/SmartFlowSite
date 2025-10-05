<!-- BADGES:START -->
[![SFS CI + Deploy](https://github.com/smartflow-systems/SmartFlowSite/actions/workflows/ci.yml/badge.svg)](https://github.com/smartflow-systems/SmartFlowSite/actions/workflows/ci.yml)
[![Reusable SFS CI](https://github.com/smartflow-systems/SmartFlowSite/actions/workflows/sfs-ci-deploy.yml/badge.svg)](https://github.com/smartflow-systems/SmartFlowSite/actions/workflows/sfs-ci-deploy.yml)
<!-- BADGES:END -->


# SmartFlowSite — SmartFlow Systems
**Dev:** `npm run dev`  •  **Prod:** `npm start`
**Health:** `GET /health` → `{"ok":true}`

## Scripts
- `dev` → nodemon/serve
- `start` → node server.js (if present)
- `health` → bash [scripts/health.sh]

## Testing
- `npm test` → runs the Node.js test runner (`node --test`) against the Express `/gh-sync` API.
- No Prisma database or additional environment variables are required—the tests stub the sync script and manage `SYNC_TOKEN` automatically.
- To verify manually, export `SYNC_TOKEN` and send an authorized POST request to `/gh-sync`; expect `401` for missing/invalid tokens and `200` for valid requests when the sync script succeeds.

## Replit
Create from GitHub → set secrets `SFS_PAT`, `REPLIT_TOKEN`, `SFS_SYNC_URL`. Port ${PORT:-5000} (or app default).

## CI
Push → GitHub Actions runs reusable CI.

## Agent Notes (see [AGENTS.md])
Show [paths]; VERIFY + UNDO; Bash uses `set -euo pipefail`. GitHub = source of truth.
