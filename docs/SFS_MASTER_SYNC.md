# SFS_MASTER_SYNC.md
# SmartFlow Systems — Sync and Deployment Protocols
# Last updated: 2026-03-29

---

## Source of Truth

All CI/CD patterns originate from SmartFlowSite.
Every other repo must align to it.

```
Control repo:  https://github.com/smartflow-systems/SmartFlowSite
CI file:       .github/workflows/ci.yml
Health check:  GET /health → {"ok":true}
Branch:        main = production
```

---

## Standard CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:    # ESLint / Flake8
  test:    # Jest / Pytest
  build:   # npm run build / pip install
  health:  # curl GET /health → {"ok":true}
  deploy:  # Replit sync via SFS_SYNC_URL
```

### Required Secrets
```
SFS_PAT       — GitHub personal access token (required)
REPLIT_TOKEN  — Replit deploy token (optional)
SFS_SYNC_URL  — Replit sync endpoint (optional)
```

Manage at: https://github.com/organizations/smartflow-systems/settings/secrets/actions

---

## Health Check Standard

Every deployable SFS app must expose:

```
GET /health → 200 {"ok":true}
```

Node.js:
```js
app.get('/health', (req, res) => res.json({ ok: true }));
```

Python/FastAPI:
```python
@app.get("/health")
def health(): return {"ok": True}
```

Verify:
```bash
curl -s http://localhost:5000/health | grep '"ok":true'
```

---

## Scaffold CI for a New Repo

```bash
# 🖥️ Replit Shell — run from repo root
set -euo pipefail
mkdir -p .github/workflows
curl -s https://raw.githubusercontent.com/smartflow-systems/SmartFlowSite/main/.github/workflows/ci.yml \
  -o .github/workflows/ci.yml
git add .github/workflows/ci.yml
git commit -m "ci: add SFS standard CI workflow"
git push origin main
```

---

## Add Secrets to a Repo

```bash
# 🖥️ Shell
gh secret set SFS_PAT --body "$SFS_PAT"
gh secret set REPLIT_TOKEN --body "$REPLIT_TOKEN"
gh secret set SFS_SYNC_URL --body "$SFS_SYNC_URL"
```

Add to org (applies to all repos):
```bash
gh secret set SFS_PAT --org smartflow-systems --body "$SFS_PAT"
```

---

## Replit Deploy Pattern

Set in Replit environment:
```
PORT=5000
NODE_ENV=production
DATABASE_URL=...
SFS_PAT=...
```

Trigger deploy:
```bash
curl -X POST "$SFS_SYNC_URL" \
  -H "Authorization: Bearer $REPLIT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Knowledge File Sync (GPTs + Claude Projects)

When any knowledge file changes:

1. Run `bash sfs-sync.sh` on dev machine to pull from GitHub
2. Re-upload changed files to all 4 ChatGPT GPTs
3. Re-upload changed files to all 4 Claude Projects
4. Do all 8 destinations at the same time

Auto-sync script: `sfs-sync.sh`
Source paths in SmartFlowSite:
```
docs/SmartFlow-Agent-Master.md
docs/Repo-Map.md
docs/Roadmap.md
docs/SFS_MASTER_SYNC.md
docs/Secrets-Checklist.md
docs/README.md
marketing/revenue-tracker.md
agents/barber-booker-agent.md
agents/social-scale-agent.md
agents/revenue-tracker.md
```

---

## Repo Sync Check

```bash
# Check last commit across active repos
for repo in SmartFlowSite Barber-booker-v1 SocialScaleBooster SFS-Backend; do
  echo "=== $repo ==="
  git -C /home/garet/SFS/$repo log --oneline -3
done
```

---

## CI Status Check

```bash
# 🖥️ Shell
gh run list --limit 10
gh run view [RUN_ID]
```

Re-run failed pipeline:
```bash
gh run rerun [RUN_ID]
```

---

## Pending Org Issues

| Issue | Action | Status |
|-------|--------|--------|
| SFS-SocialPowerhouse on boweazy org | Transfer to smartflow-systems | ⏳ Pending |
| sfs-white-label-dashboard on boweazy org | Transfer to smartflow-systems | ⏳ Pending |
| SmartFlowSite -v2 and -security-fix duplicates | Delete duplicates | ⏳ Pending |

Transfer a repo:
🌐 GitHub → repo Settings → Danger Zone → Transfer repository

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| Secret not found | Not set in repo/org | `gh secret set [NAME]` |
| Health check fails | Wrong port | Check `PORT` env var |
| Build fails | Missing deps | `npm ci` or `pip install -r requirements.txt` |
| Deploy times out | Replit cold start | Increase timeout in workflow |
| SFS_PAT permission denied | Token expired | Rotate at GitHub → Settings → Tokens |

---

## VERIFY
```bash
gh run list --limit 5
curl -s https://[your-replit-url]/health
gh secret list --repo smartflow-systems/[REPO]
git log --oneline -5
```

## UNDO
```bash
# Revert last commit
git revert HEAD --no-edit
git push origin main

# Remove bad workflow
git rm .github/workflows/ci.yml
git commit -m "ci: remove broken workflow"
git push origin main
```

---

*SFS_MASTER_SYNC v1.0 — SmartFlow Systems*
*Last updated: 2026-03-29*
