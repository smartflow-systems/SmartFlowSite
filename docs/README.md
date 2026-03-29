# SmartFlow Systems

AI-powered SaaS tools for barbers, salons, and small service businesses.

**Owner:** boweazy (Garet) | **Org:** https://github.com/smartflow-systems

---

## Products

| Product | Purpose | Status | Price |
|---------|---------|--------|-------|
| [Barber-booker-v1](https://github.com/smartflow-systems/Barber-booker-v1) | 24/7 online booking, Google Cal, Stripe | ⭐ Production | From £29/mo |
| [SocialScaleBooster](https://github.com/smartflow-systems/SocialScaleBooster) | AI captions + social scheduling | ⭐ Production | From £29/mo |
| [SocialScaleBoosterAIbot](https://github.com/smartflow-systems/SocialScaleBoosterAIbot) | No-code AI bot builder | Production | TBC |
| [DataQueryEngine](https://github.com/smartflow-systems/DataQueryEngine) | Natural language to SQL | Production | TBC |
| [sfs-white-label-dashboard](https://github.com/smartflow-systems/sfs-white-label-dashboard) | Multi-tenant admin platform | Active dev | Per tenant |
| [SFSAPDemoCRM](https://github.com/smartflow-systems/SFSAPDemoCRM) | CRM + lead management | Active dev | TBC |

---

## Stack

```
Frontend:  React 18/19, TypeScript, Tailwind CSS, Radix UI
Backend:   Node.js (Express), Python (FastAPI), Prisma ORM
Database:  SQLite (dev), PostgreSQL (prod)
AI:        OpenAI GPT-4o-mini
Payments:  Stripe, Stripe Connect
Email:     SendGrid
Auth:      JWT, OAuth, RBAC
Deploy:    Replit + GitHub Actions
```

---

## Repo Structure

```
/home/garet/SFS/
├── SmartFlowSite/          ← CI/CD source of truth
├── Barber-booker-v1/       ← #1 sales priority
├── SocialScaleBooster/     ← #2 sales priority
├── SFS-Backend/            ← Centralised API
├── sfs-white-label-dashboard/
├── smartflow-hub/
└── [26 more repos...]
```

See [Repo-Map.md](./Repo-Map.md) for the full list.

---

## CI/CD

All repos follow SmartFlowSite patterns.

```yaml
# .github/workflows/ci.yml
Trigger: push/PR → main
Jobs:    lint → test → build → health → deploy
Health:  GET /health → {"ok":true}
```

Required secrets: `SFS_PAT` | Optional: `REPLIT_TOKEN`, `SFS_SYNC_URL`

Manage at: https://github.com/organizations/smartflow-systems/settings/secrets/actions

---

## Brand

```
Black:  #0D0D0D
Brown:  #3B2F2F
Gold:   #FFD700
UI:     Tailwind CSS + Radix UI — no exceptions
```

---

## AI Suite

| Mode | ChatGPT GPT | Claude Project |
|------|-------------|----------------|
| Operator | SmartFlow Operator | SFS Operator |
| Build Partner | SmartFlow Build Partner | SFS Build Partner |
| Consultant | SmartFlow Consultant | SFS Consultant |
| Agent | SmartFlow Agent | SFS Agent |

---

## Quick Commands

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run health        # Health check
git push origin main  # Deploy via CI/CD
gh run list           # CI status
gh secret list --org smartflow-systems
```

---

## Current Focus

**MRR: £0 | Customers: 0**

Stop building. Start selling. First target: UK barber or salon owner.
No new features until MRR > £1,000.

---

*SmartFlow Systems — v1.0*
*Last updated: 2026-03-29*
