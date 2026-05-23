# SFS Master Context

Single file with full SmartFlow Systems context.
Use this to brief any AI tool cold — paste the whole thing.

Last updated: 2026-03-28

---

## Who We Are

SmartFlow Systems (SFS) is a SaaS ecosystem of 49 GitHub repositories
covering social media automation, booking systems, data analytics,
white-label dashboards, and AI-powered business tools for barbers,
salons, and small service businesses.

Owner: boweazy (Garet)
Org: https://github.com/smartflow-systems
Local workspace: /home/garet/SFS/
Brand: black #0D0D0D / brown #3B2F2F / gold #FFD700 — never deviate

---

## Business Reality

- 6 months building → £0 revenue, 0 customers
- 8 products are production-ready
- Problem is sales execution, not technical capability
- Top priority: close first paying customer (barber/salon)
- Do not start new builds until MRR > £1,000

---

## Stack

Frontend:   React 18/19, TypeScript, Tailwind CSS, Radix UI, Lucide React
Backend:    Node.js (Express), Python (FastAPI), Prisma ORM
Database:   SQLite (dev), PostgreSQL (prod)
AI/ML:      OpenAI GPT-4o-mini
Payments:   Stripe, Stripe Connect
Email:      SendGrid + SMTP
Auth:       JWT, OAuth, RBAC (Owner/Admin/Staff/Analyst)
Deploy:     Replit (primary), GitHub Actions CI/CD

### NOT in the stack

- ChromaDB — not implemented
- ConvertKit — not implemented
- Mailchimp — not implemented
- LangChain — not implemented

---

## Source of Truth

All CI/CD patterns come from SmartFlowSite:
https://github.com/smartflow-systems/SmartFlowSite

Standard health check: GET /health → {"ok":true}
Standard CI file: .github/workflows/ci.yml

---

## Production-Ready Repos

1. SmartFlowSite — main site + CI control
2. Barber-booker-v1 — #1 sales priority
3. SocialScaleBooster — #2 sales priority
4. SocialScaleBoosterAIbot — AI bot builder
5. SFS-SocialPowerhouse — wrong org, move to smartflow-systems
6. DataQueryEngine — natural language to SQL
7. DataScrapeInsights — scraping + insights
8. sfs-analytics-engine — analytics backend

---

## Active Development Repos

1. sfs-white-label-dashboard — wrong org, move to smartflow-systems
2. smartflow-hub — unified dashboard + Claude integration
3. sfs-revenue-analytics — revenue optimisation
4. SFS-Backend — centralised API
5. SFSAPDemoCRM — CRM + lead management
6. sfs-marketing-and-growth — marketing + booking
7. sfs-core-utils — shared utilities
8. sfs-intelligence-engine — FastAPI AI
9. AP-CRM — CRM
10. sfs-social-content-generator — barber demo tool
11. smartflow-systems-control-room — skill package
12. SmartFlowSite real only — /home/garet/SFS/SmartFlowSite

---

## Skeleton / Planned Repos

29 placeholder repos. Do not invest time here until MRR > £1,000.

---

## GitHub Issues to Resolve

| Issue | Action |
|---|---|
| SFS-SocialPowerhouse on boweazy org | Transfer to smartflow-systems |
| sfs-white-label-dashboard on boweazy org | Transfer to smartflow-systems |
| SmartFlowSite-v2 and SmartFlowSite-security-fix exist | Archive/delete after verification |

---

## Secrets

Required:
- SFS_PAT

Optional:
- REPLIT_TOKEN
- SFS_SYNC_URL

Never expose values. Reference as environment variables only.

---

## Agent Roster

### ChatGPT Custom GPTs

| Agent | Speciality |
|---|---|
| Operator | Daily ops, CI/CD |
| Build Partner | Engineering, scaffolding |
| Consultant | Strategy, roadmap |
| Agent | Single-repo execution |

### Claude Project Agents

| Agent | File | Speciality |
|---|---|---|
| CI/CD Agent | ci-cd-agent.md | Pipelines, deployments |
| Stripe Agent | stripe-billing-agent.md | Billing, subscriptions |
| White Label Agent | white-label-agent.md | Multi-tenant ops |
| Barber Booker Agent | barber-booker-agent.md | Booking system |
| Social Scale Agent | social-scale-agent.md | Social automation |
| Revenue Tracker | revenue-tracker.md | MRR, pipeline, milestones |

---

## Output Rules

- Plain talk → code.
- No fluff.
- Use file paths in brackets.
- Mark overwrites.
- Apply-All Bash must use set -euo pipefail.
- Always include VERIFY and UNDO.
- Keep explanations short unless deep technical detail is required.
- Brand: black/brown/gold — Tailwind CSS + Radix UI. No exceptions.
- Call owner “boweazy” in dev/ops context.
- Call owner “Gareth” in public/client-facing content.

---

## Triggers

| Trigger | Action |
|---|---|
| STATUS | Repo health + next 3 steps |
| CONSOLIDATE | Full task + Apply-All + Verify + Undo |
| DIAGNOSE | Max 2 clarifiers → fix |
| FULL FILE [path] | Full file output |
| ROLLBACK | Undo last action |
| REWIND FROM HERE | Restart from clean state |
| LET'S BASH | Output Apply-All block |

---

## Roadmap

v0.2 → /api/boost, CORS, copy button, counter, landing copy, public link
v0.3 → presets, save 10, webhook
v0.4 → calendar, CSV, analytics, pricing, barber case study

Revenue milestone gate: no new features until £1,000 MRR.

---

## Common Commands

npm run dev
npm run build
npm run health
git push origin main
gh pr create
gh run list
gh secret list --org smartflow-systems

---

SFS-MASTER-CONTEXT v1.1 — corrected
SmartFlow Systems AI Suite
