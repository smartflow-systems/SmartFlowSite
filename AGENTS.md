# AI Agent Guidelines for SmartFlowSite

**Last Updated:** 2026-06-21  
**Status:** Control Tower override active

---

## Control Tower Override — Read First

**ChatGPT / SFS Control Tower** is the routing and decision layer for SmartFlow Systems work.

| Role | Agent | Scope |
|---|---|---|
| Router + decision layer | ChatGPT / SFS Control Tower | Approves task route, mode, and safe next move |
| Read-only planner/reviewer | Hermes | Plans, reviews, repo maps, risk checks; does not execute |
| Coding executor | Codex Local / Codex Business Cloud | Executes only after explicit approval |
| Terminal helper | Grok Terminal | Terminal-side help only |
| Analysis + notes | Notebook LLM | Tables, repo maps, analysis, learning notes |
| Cloud/chat helper | Claudia AI | Follows SmartFlow safety rules; not the control brain |

No agent becomes the ecosystem router. That role belongs to ChatGPT / SFS Control Tower.

---

## Git Workflow

PR-first is the default for normal SmartFlowSite changes.

Direct push to `main` requires explicit Garet approval per task.

Old wording that allowed direct push to `main` without a PR is stale and overridden.

Commit format:

- `feat: description`
- `fix: description`
- `docs: description`
- `refactor: description`
- `chore: description`

Any push that may trigger CI/CD must be approved first.

---

## Approval Modes

### READ-ONLY ONLY

Allowed:

- inspect safe files
- review diffs
- map repo structure
- produce reports

Not allowed:

- edit files
- delete files
- install packages
- deploy
- push
- run migrations
- open or print secrets

### APPROVE WRITE

Allowed only within the approved repo/file/scope.

Still not allowed unless separately approved:

- deploy
- push
- install packages
- run migrations
- touch secrets

### APPROVE MEMORY UPDATE ONLY

Allowed only for approved memory-vault markdown files.

Do not edit repo code.

---

## Secret Safety Rules

Never open, print, copy, summarise, or store secret values.

Do not open or print:

- `.env`
- `.env.local`
- auth tokens
- private keys
- API keys
- database URLs
- cookies
- production logs containing sensitive data
- billing/customer data

Secret names are okay. Secret values are not.

---

## SmartFlowSite Role

SmartFlowSite is the SmartFlow Systems source-of-truth site for:

- public direction
- documentation
- brand
- CI/CD references
- control-tower guidance

It should not be treated as a place to test risky repo-wide automation.

---

## SmartFlow Priority Context

Current operating mode:

- build working systems first
- keep the ecosystem understandable
- one repo, one task, one output
- Barber Booker remains high priority because it is closest to demo/customer value
- SocialScaleBooster comes after Barber Booker and core ecosystem structure

Do not default to sales, launch, outreach, or revenue-first work unless Garet explicitly asks.

---

## Brand Rules

SmartFlow colours:

- black: `#0D0D0D`
- brown: `#3B2F2F`
- gold: `#FFD700`

Preferred style:

- Tailwind CSS
- Radix UI
- Lucide React
- Inter
- JetBrains Mono
- glassmorphism
- Digital Circuit Luxe

Brand must not override:

- accessibility
- readability
- focus states
- disabled states
- semantic success/error/warning states

---

## Safe Working Rules

Use WSL Bash for SmartFlow repo work unless Garet asks for PowerShell.

Do not run blanket commands across all repos.

Do not run:

- `git add .`
- `git commit`
- `git push`
- `npm install`
- `npm audit fix`
- `npx`
- `vercel`
- `replit`
- `rm -rf`
- migration commands
- deploy commands

unless explicitly approved for the exact repo and task.

All command blocks in agent outputs are reference only unless Garet approves execution.
