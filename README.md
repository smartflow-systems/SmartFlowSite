<!-- BADGES:START -->
[![SFS CI + Deploy](https://github.com/smartflow-systems/SmartFlowSite/actions/workflows/ci.yml/badge.svg)](https://github.com/smartflow-systems/SmartFlowSite/actions/workflows/ci.yml)
[![Reusable SFS CI](https://github.com/smartflow-systems/SmartFlowSite/actions/workflows/sfs-ci-deploy.yml/badge.svg)](https://github.com/smartflow-systems/SmartFlowSite/actions/workflows/sfs-ci-deploy.yml)
<!-- BADGES:END -->


# SmartFlowSite — SmartFlow Systems

## Current role
SmartFlowSite is the public/docs/control/source-of-truth support repo for SmartFlow Systems.
It supports the fresh SFS rebuild and AI Creator OS direction.
It is not the ecosystem control brain, autonomous orchestrator, store API, or main product app.

**Dev:** `npm run dev`  •  **Prod:** `npm start`
**Health:** `GET /health` → `{"ok":true}`

## Scripts
- `dev` → `node server.js`
- `start` → node server.js (if present)
- `health` → bash [scripts/sfs-verify.sh]

## Replit
Create from GitHub → set secrets `SFS_PAT`, `REPLIT_TOKEN`, `SFS_SYNC_URL`. Port ${PORT:-5000} (or app default).

## CI
Push → GitHub Actions runs reusable CI.

**Approval note:** deploys, pushes, CI/CD-triggering actions, and secret handling require exact approval.
Secret names may be documented, but secret values must never be printed or inspected.

## Agent Notes (see [AGENTS.md])
Show [paths]; VERIFY + UNDO; Bash uses `set -euo pipefail`. GitHub = source of truth.

For agent rules, see [AGENTS.md](AGENTS.md).
