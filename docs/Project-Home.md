# SFS — Powerhouse · Project Home
> Snapshot of your live canvas dashboard (edit freely).

## Next action
- [ ] **Do this next:** _type here_

## Today
- [ ] Ship tiny win · [ ] Push branch → PR · [ ] CI green
- [ ] Update Roadmap.md · [ ] Log in Runbook-Diagnose.md

### Today — 3 Links
- [ ] [Link 1] → https://
- [ ] [Link 2] → https://
- [ ] [Link 3] → https://

**Current repo / branch (paste):**  
- [ ] **Repo:** `___` • **Branch:** `___`

## CI at a glance
- [ ] PR checks green • [ ] CodeQL 0 alerts • [ ] Main deploy OK
- [ ] `/health` 200 (local/prod)

### Quick health (Shell)
curl -sS http://localhost:5000/health | grep '"ok":true' && echo OK || echo FAIL

## STATUS Shortcuts
- Org Actions → https://github.com/orgs/smartflow-systems/actions
- SmartFlowSite → Actions / PRs / CodeQL  
  https://github.com/smartflow-systems/SmartFlowSite/actions  
  https://github.com/smartflow-systems/SmartFlowSite/pulls  
  https://github.com/smartflow-systems/SmartFlowSite/security/code-scanning

## PR Shortcuts (replace BRANCH)
- SmartFlowSite → https://github.com/smartflow-systems/SmartFlowSite/compare/main...BRANCH?quick_pull=1&title=feat/YYYY-MM-DD-tiny-win&body=Checklist:+tests+pass+%7C+CI+green
- SFSDataQueryEngine → https://github.com/smartflow-systems/SFSDataQueryEngine/compare/main...BRANCH?quick_pull=1&title=feat/YYYY-MM-DD-tiny-win&body=Checklist:+tests+pass+%7C+CI+green
- SocialScaleBoosterAIbot → https://github.com/smartflow-systems/SocialScaleBoosterAIbot/compare/main...BRANCH?quick_pull=1&title=feat/YYYY-MM-DD-tiny-win&body=Checklist:+tests+pass+%7C+CI+green
- SFSAPDemoCRM → https://github.com/smartflow-systems/SFSAPDemoCRM/compare/main...BRANCH?quick_pull=1&title=feat/YYYY-MM-DD-tiny-win&body=Checklist:+tests+pass+%7C+CI+green
- sfs-marketing-and-growth → https://github.com/smartflow-systems/sfs-marketing-and-growth/compare/main...BRANCH?quick_pull=1&title=feat/YYYY-MM-DD-tiny-win&body=Checklist:+tests+pass+%7C+CI+green

### Shell helper (print one-click PR link)
R="SmartFlowSite"; BR="$(git rev-parse --abbrev-ref HEAD)"; DT="$(date +%F)"; \
echo "https://github.com/smartflow-systems/$R/compare/main...$BR?quick_pull=1&title=feat/$DT-tiny-win&body=Checklist:+tests+pass+%7C+CI+green"

## Brand
Black #0D0D0D · Brown #3B2F2F · Gold #FFD700 (hover #E6C200) · Beige #F5F5DC · White #FFFFFF
