# CI How-To (Reusable Workflow)
Use from any repo:

```yaml
name: SFS CI Deploy
on:
  push:
    branches: ["main"]
jobs:
  call-sfs:
    uses: smartflow-systems/SmartFlowSite/.github/workflows/sfs-ci-deploy.yml@main
    secrets: inherit


### 2) Add missing prompt + index — Replit **Shell**
```bash
[ -s gpts/build-partner.md ] || cat > gpts/build-partner.md <<'MD'
Role: SmartFlow Build Partner — dev/CI coach.
Rules: Bash-first; exact [paths]; Verify+Undo; ≤1500 chars; EU/London.
ST: CONSOLIDATE, STATUS, FULL FILE [path], ROLLBACK, REWIND FROM HERE, DIAGNOSE.
Brand: black #0D0D0D, brown #3B2F2F, gold #FFD700 (hover #E6C200).
