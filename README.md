# SmartFlowSite

> The SmartFlow Systems main hub — a portfolio site showcasing 30+ automation tools for service businesses, with live demo links and a lead capture system.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit-FFD700?style=for-the-badge&logo=replit&logoColor=black)](https://smartflowsystems.replit.app)
[![SmartFlow Systems](https://img.shields.io/badge/SmartFlow-Systems-0a0a0a?style=for-the-badge)](https://github.com/smartflow-systems)

---

## What It Does

SmartFlowSite is the public-facing home of the SmartFlow Systems product suite. It is a single-page application that dynamically renders cards for 30+ automation tools — covering booking, CRM, AI bots, analytics, e-commerce, and more — loaded from a JSON configuration file. Each card links to a live demo or GitHub repository. The site acts as both a marketing tool and a central directory for prospects to discover and try each product. It includes a lead-capture form, Stripe subscription checkout, and Calendly booking integration to convert visitors into customers.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | JavaScript |
| Runtime | Node.js 18+ |
| Framework | Express.js (static file server + REST API) |
| Frontend | Vanilla JS + HTML/CSS (no frontend framework), hash-based SPA routing |
| Database / Storage | JSON flat-files (`systems.json`, `posts.json` in `/public/data/`; `leads.json` for captured leads) |
| Key packages | express, helmet, cors, express-rate-limit, stripe, jsonwebtoken, bcryptjs |

---

## How to Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/smartflow-systems/SmartFlowSite.git
cd SmartFlowSite

# 2. Install dependencies
npm install

# 3. Copy the environment variables file and fill in your values
cp .env.example .env

# 4. Start the server
npm start
```

The site will be available at `http://localhost:5000`.

---

## Environment Variables

| Variable | Required | Description | Example |
|---|---|---|---|
| `ADMIN_API_KEY` | Yes | API key required to access admin-protected endpoints | `change-me-to-random-string` |
| `JWT_SECRET` | Yes | Secret used to sign authentication tokens | `your-secret-key` |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key for subscription billing | `sk_test_abc123` |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret | `whsec_xyz789` |
| `STRIPE_STARTER_PRICE_ID` | Yes | Stripe price ID for the Starter plan | `price_abc123` |
| `STRIPE_PRO_PRICE_ID` | Yes | Stripe price ID for the Pro plan | `price_def456` |
| `STRIPE_PREMIUM_PRICE_ID` | Yes | Stripe price ID for the Premium plan | `price_ghi789` |
| `OPENAI_API_KEY` | No | OpenAI API key (for AI orchestrator features) | `sk-proj-abc123` |
| `ANTHROPIC_API_KEY` | No | Anthropic API key (for Claude-based features) | `sk-ant-abc123` |
| `SFS_PAT` | No | GitHub personal access token for sync/deploy scripts | `ghp_abc123` |
| `PORT` | No | Port the server listens on | `3000` |
| `NODE_ENV` | No | Runtime environment | `production` |

---

## API Endpoints

| Method | Route | Auth required | Description |
|---|---|---|---|
| `GET` | `/health` | No | Health check |
| `GET` | `/api/health` | No | Health check (API path) |
| `POST` | `/api/leads` | No | Capture a visitor lead (name, email, company) |
| `GET` | `/api/leads` | API key (`requireAuth`) | List all captured leads |
| `POST` | `/api/stripe/checkout` | No | Initiate a Stripe checkout session |
| `POST` | `/api/stripe/webhook` | Stripe signature | Handle Stripe subscription lifecycle events |

> Static content (HTML, CSS, JS, JSON data) is served directly from `/public`.

---

## How It Connects to SmartFlow Systems

- **Main hub** — This IS the main hub. Every other SFS repo is linked from the product cards on this site.
- **Design system** — follows the SFS design system (gold `#FFD700` on dark `#0a0a0a`). See [`sfs-claude-skills`](https://github.com/smartflow-systems/sfs-claude-skills) for the full token reference.
- **Stripe** — Three-tier subscription billing (Starter, Pro, Premium) with Stripe Checkout, webhook lifecycle handling, and price ID configuration.
- **Other integrations** — Calendly embed for demo booking (`calendly.com/boweazy123`); JSON-driven card system (`systems.json`) for easy content updates without code changes.

---

## Live Demo

**https://smartflowsystems.replit.app** — Main SmartFlow Systems portfolio hub with 30+ product cards, live demo links, and lead capture.

---

## Design System

This repo follows the SmartFlow Systems design system.

- Brand colours: Gold `#FFD700` on dark background `#0a0a0a`
- Typography: Inter (headings), system-ui (body)
- Full token reference and component rules: [`sfs-claude-skills/sfs-design-system/SKILL.md`](https://github.com/smartflow-systems/sfs-claude-skills/blob/main/sfs-design-system/SKILL.md)

---

## Contact

| | |
|---|---|
| Sales enquiries | [sales@smartflowsystems.com](mailto:sales@smartflowsystems.com) |
| Book a demo | [calendly.com/boweazy123](https://calendly.com/boweazy123) |

---

## Part of the SmartFlow Systems Suite

SmartFlow Systems builds automation tools for modern businesses — booking, CRM, e-commerce, AI bots, analytics, and more.

| | |
|---|---|
| Website | [smartflowsystems.replit.app](https://smartflowsystems.replit.app) |
| All repos | [github.com/smartflow-systems](https://github.com/smartflow-systems) |

---

*Built by SmartFlow Systems.*
