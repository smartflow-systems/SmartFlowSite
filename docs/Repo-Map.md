# Repo-Map.md
# SmartFlow Systems — Full Repo Map
# Last updated: 2026-04-07

Org: https://github.com/smartflow-systems
Local workspace: /home/garet/SFS/
CI source of truth: SmartFlowSite → .github/workflows/ci.yml

---

## Tier 1 — Production-Ready (8 repos)

These are the only repos that matter for revenue right now.

| Repo | GitHub URL | Local Path | Purpose | Priority |
|------|-----------|------------|---------|----------|
| SmartFlowSite | https://github.com/smartflow-systems/SmartFlowSite | /home/garet/SFS/SmartFlowSite | Main site + CI/CD control | CI source of truth |
| Barber-booker-v1 | https://github.com/smartflow-systems/Barber-booker-v1 | /home/garet/SFS/Barber-booker-v1 | 24/7 booking system, Google Cal, Stripe | ⭐ #1 sales priority |
| SocialScaleBooster | https://github.com/smartflow-systems/SocialScaleBooster | /home/garet/SFS/SocialScaleBooster | AI social captions + scheduling | ⭐ #2 sales priority |
| SocialScaleBoosterAIbot | https://github.com/smartflow-systems/SocialScaleBoosterAIbot | /home/garet/SFS/SocialScaleBoosterAIbot | AI bot builder | — |
| SFS-SocialPowerhouse | https://github.com/smartflow-systems/SFS-SocialPowerhouse | /home/garet/SFS/SFS-SocialPowerhouse | Social platform (205 tests) | — |
| DataQueryEngine | https://github.com/smartflow-systems/DataQueryEngine | /home/garet/SFS/DataQueryEngine | NL to SQL analytics | — |
| DataScrapeInsights | https://github.com/smartflow-systems/DataScrapeInsights | /home/garet/SFS/DataScrapeInsights | Data scraping + insights | — |
| sfs-analytics-engine | https://github.com/smartflow-systems/sfs-analytics-engine | /home/garet/SFS/sfs-analytics-engine | Analytics backend | — |

---

## Tier 2 — Active Development (12 repos)

| Repo | GitHub URL | Local Path | Purpose | Notes |
|------|-----------|------------|---------|-------|
| sfs-white-label-dashboard | https://github.com/smartflow-systems/sfs-white-label-dashboard | /home/garet/SFS/sfs-white-label-dashboard | Multi-tenant admin | — |
| smartflow-hub | https://github.com/smartflow-systems/smartflow-hub | /home/garet/SFS/smartflow-hub | Unified Next.js dashboard + Claude integration | Not in ChatGPT knowledge |
| sfs-revenue-analytics | https://github.com/smartflow-systems/sfs-revenue-analytics | /home/garet/SFS/sfs-revenue-analytics | Revenue optimization | Not in ChatGPT knowledge |
| SFS-Backend | https://github.com/smartflow-systems/SFS-Backend | /home/garet/SFS/SFS-Backend | Centralised API | — |
| SFSAPDemoCRM | https://github.com/smartflow-systems/SFSAPDemoCRM | /home/garet/SFS/SFSAPDemoCRM | CRM + lead management | — |
| sfs-marketing-and-growth | https://github.com/smartflow-systems/sfs-marketing-and-growth | /home/garet/SFS/sfs-marketing-and-growth | Marketing automation + booking | — |
| sfs-core-utils | https://github.com/smartflow-systems/sfs-core-utils | /home/garet/SFS/sfs-core-utils | Shared utilities + design tokens | — |
| sfs-intelligence-engine | https://github.com/smartflow-systems/sfs-intelligence-engine | /home/garet/SFS/sfs-intelligence-engine | FastAPI AI: sentiment, intent, risk | — |
| AP-CRM | https://github.com/smartflow-systems/AP-CRM | /home/garet/SFS/AP-CRM | CRM | £29+/month planned |
| sfs-social-content-generator | https://github.com/smartflow-systems/sfs-social-content-generator | /home/garet/SFS/sfs-social-content-generator | Barber demo tool (FastAPI + Replicate) | — |
| smartflow-systems-control-room | https://github.com/smartflow-systems/smartflow-systems-control-room | /home/garet/SFS/smartflow-systems-control-room | Skill package: CI/CD, brand, workflows | 104KB, 10 files |
| sfs-core-services | https://github.com/smartflow-systems/sfs-core-services | /home/garet/SFS/sfs-core-services | Core shared services | — |

---

## Tier 3 — Skeleton / Planned (29 repos)

Do not invest time here until MRR > £1,000.
These are placeholder repos with no active development.

---

## GitHub Issues to Resolve

| Issue | Action | Status |
|-------|--------|--------|
| SmartFlowSite -v2 and -security-fix duplicates | Delete — /home/garet/SFS/SmartFlowSite is the only real one | ⏳ Pending |

---

## CLAUDE.md Locations (Claude Code context)

| Path | Repo |
|------|------|
| /home/garet/SFS/CLAUDE.md | SFS workspace root |
| /home/garet/SFS/SmartFlowSite/CLAUDE.md | SmartFlowSite |
| /home/garet/SFS/SocialScaleBooster/CLAUDE.md | SocialScaleBooster |
| /home/garet/SFS/SocialScaleBoosterAIbot/CLAUDE.md | SocialScaleBoosterAIbot |
| /home/garet/SFS/SFSDataQueryEngine/CLAUDE.md | SFSDataQueryEngine |
| /home/garet/SFS/SFSAPDemoCRM/CLAUDE.md | SFSAPDemoCRM |
| /home/garet/SFS/sfs-marketing-and-growth/CLAUDE.md | sfs-marketing-and-growth |
| /home/garet/SFS/Barber-booker-v1/CLAUDE.md | Barber Booker |
| /home/garet/SFS/sfs-white-label-dashboard/CLAUDE.md | White Label Dashboard |
| /home/garet/SFS/smartflow-hub/CLAUDE.md | smartflow-hub |

---

## CI/CD Standard

All repos use SmartFlowSite as pattern source.

```
Trigger:  push/PR → main
Jobs:     lint → test → build → health → deploy
Health:   GET /health → {"ok":true}
Secrets:  SFS_PAT (required), REPLIT_TOKEN, SFS_SYNC_URL
CI file:  .github/workflows/ci.yml
```

---

## Quick Links

| Resource | URL |
|----------|-----|
| GitHub Org | https://github.com/smartflow-systems |
| Org Secrets | https://github.com/organizations/smartflow-systems/settings/secrets/actions |
| SmartFlowSite CI | https://github.com/smartflow-systems/SmartFlowSite/blob/main/.github/workflows/ci.yml |

---

*Repo-Map v1.1 — SmartFlow Systems*
*Last updated: 2026-04-07*
