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


**TASK: Ensure missing files exist (idempotent)**
Shell:
```bash
mkdir -p gpts assets/brand marketing
[ -s gpts/build-partner.md ] || cat > gpts/build-partner.md <<'MD'
Role: Dev/CI coach. Honor ST triggers. Bash-first; [paths]; Verify+Undo.
