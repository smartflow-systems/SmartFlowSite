# Runbook — Diagnose
**Enter repo:**
for d in "$HOME/workspace/SmartFlowSite" "$HOME/SmartFlowSite" "$PWD"; do [ -d "$d/.git" ] && { cd "$d"; break; }; done; git rev-parse --is-inside-work-tree >/dev/null

**Quick checks:**
- git status -sb
- gh auth status (optional)
- grep -R "uses: smartflow-systems/SmartFlowSite/.github/workflows/sfs-ci-deploy.yml@main" -n
- cat .github/workflows/sfs-ci-deploy.yml
