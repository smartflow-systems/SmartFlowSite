# SmartFlow Agent Master

**Version:** 2.0
**Last updated:** 2026-03-29
**Owner:** boweazy (Garet)
**Org:** https://github.com/smartflow-systems

> Paste this file cold into any AI tool to give it full SFS context.

---

## Who We Are

SmartFlow Systems (SFS) is a SaaS ecosystem covering social media automation,
booking systems, data analytics, white-label dashboards, and AI-powered
business tools for barbers, salons, and small service businesses.

- **Local workspace:** `/home/garet/SFS/`
- **Brand:** black `#0D0D0D` / brown `#3B2F2F` / gold `#FFD700` — never deviate
- **Timezone:** Europe/London

---

## Business Reality

- 6 months building → **£0 revenue, 0 customers**
- 8 products are production-ready
- Problem is **sales execution**, not technical capability
- Top priority: close first paying customer (barber/salon)
- **Do not start new builds until MRR > £1,000**

---

## Stack

```
Frontend:   React 18/19, TypeScript, Tailwind CSS, Radix UI, Lucide React
Backend:    Node.js (Express), Python (FastAPI), Prisma ORM
Database:   SQLite (dev), PostgreSQL (prod)
AI/ML:      OpenAI GPT-4o-mini
Payments:   Stripe, Stripe Connect
Email:      SendGrid + SMTP
Auth:       JWT, OAuth, RBAC (Owner/Admin/Staff/Analyst)
Deploy:     Replit (primary), GitHub Actions CI/CD
```

### NOT in the stack — do not reference these

- ❌ ChromaDB — not implemented
- ❌ ConvertKit — not implemented
- ❌ Mailchimp — not implemented
- ❌ LangChain — not implemented

---

## Source of Truth

All CI/CD patterns come from SmartFlowSite:
https://github.com/smartflow-systems/SmartFlowSite

- Standard health check: GET /health → {"ok":true}
- Standard CI file: .github/workflows/ci.yml
- Repo count: 51 repos (as of 2026-03-29)

---

## Repos — Production-Ready (8)

These are the only repos that matter for revenue right now.

| Repo | Purpose | Priority |
|------|---------|----------|
| SmartFlowSite | Main site + CI control | CI source of truth |
| Barber-booker-tempate-v1 | Booking system for salons/barbers | #1 sales priority |
| SocialScaleBooster | AI social captions + automation | #2 sales priority |
| SocialScaleBoosterAIbot | No-code AI bot builder (freemium) | Active |
| SFS-SocialPowerhouse | Social media platform (205 tests) | Transfer to smartflow-systems org |
| SFSDataQueryEngine | Natural language to SQL | Active |
| DataScrapeInsights | Web scraping + insights | Active |
| SFSAPDemoCRM | CRM + lead management demo | Active |

---

## Repos — Active Development (key ones)

| Repo | Purpose | Notes |
|------|---------|-------|
| sfs-white-label-dashboard | Multi-tenant admin dashboard | On boweazy org — transfer |
| smartflow-hub | Unified Next.js dashboard + Claude integration | — |
| sfs-revenue-analytics | Revenue tracking + analytics | — |
| SFS-Backend | Centralised API services | — |
| sfs-marketing-and-growth | Marketing automation + booking | — |
| sfs-core-utils | Shared utilities and scripts | — |

---

## GitHub Org Issues

| Issue | Action |
|-------|--------|
| SFS-SocialPowerhouse on boweazy org | Transfer to smartflow-systems |
| sfs-white-label-dashboard on boweazy org | Transfer to smartflow-systems |

---

## Secrets

Required: SFS_PAT
Optional: REPLIT_TOKEN, SFS_SYNC_URL
Location: https://github.com/organizations/smartflow-systems/settings/secrets/actions
Never expose values. Reference as $SFS_PAT only.

---

## Agent Roster

### ChatGPT Custom GPTs (business/strategy)

| Agent | Speciality |
|-------|------------|
| Operator | Daily ops, CI/CD, repo hygiene |
| Build Partner | Engineering, scaffolding, code |
| Consultant | Strategy, roadmap, decisions |

### Claude Project Agents (technical ops)

| Agent | File | Speciality |
|-------|------|------------|
| CI/CD Agent | ci-cd-agent.md | Pipelines, deployments |
| Stripe Agent | stripe-billing-agent.md | Billing, subscriptions |
| White Label Agent | white-label-agent.md | Multi-tenant ops |
| Barber Booker Agent | barber-booker-agent.md | Booking system — top sales tool |
| Social Scale Agent | social-scale-agent.md | Social automation |
| Revenue Tracker | revenue-tracker.md | MRR, pipeline, milestones |

### AI Platform Split

| Platform | Coverage |
|----------|---------|
| ChatGPT | 40% — business context, strategy |
| Claude | 60% — technical, git ops, CI/CD, code |
| Overlap | 0% — do not duplicate context |

smartflow-hub and sfs-revenue-analytics are NOT in ChatGPT knowledge.

---

## Output Rules (all modes)

- Plain talk then code. No fluff.
- File paths in [brackets]
- Mark overwrites (OVERWRITE)
- Apply-All Bash blocks: always set -euo pipefail
- Always include VERIFY and UNDO steps
- Brand: black/brown/gold — Tailwind CSS + Radix UI. No exceptions.
- Call owner boweazy in dev/ops context, Gareth in public/client-facing content

---

## Mode Triggers

| Trigger | Action |
|---------|--------|
| STATUS | Repo health + next 3 steps |
| CONSOLIDATE | Full task + Apply-All + Verify + Undo |
| DIAGNOSE | Max 2 clarifiers then fix |
| FULL FILE [path] | Full file output, no truncation |
| ROLLBACK | Undo last action |
| REWIND FROM HERE | Restart from clean state |
| LET'S BASH | Output Apply-All block only |

---

## Roadmap

v0.2 → /api/boost, CORS, copy button, counter, landing copy, public link
v0.3 → presets, save 10, webhook
v0.4 → calendar, CSV, analytics, pricing, barber case study

Revenue gate: No new features until £1,000 MRR.

---

## Common Commands

npm run dev           # Start dev server
npm run build         # Build for production
npm run health        # Health check
git push origin main  # Deploy via CI/CD
gh pr create          # Open pull request
gh run list           # Check CI status
bash sfs-sync.sh      # Sync knowledge files to OneDrive

---

SmartFlow Agent Master v2.0 — rebuilt 2026-03-29
