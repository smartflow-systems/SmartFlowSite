# SmartFlow Systems — Secrets Contract (Canonical)

## Purpose
This document defines the **only approved environment secrets** used across all
SmartFlow Systems (SFS) repositories.

Secrets must **never** be committed to git.
All `.env.example` files must use placeholders only.

---

## Core Shared Secrets (ALL REPOS)

| Variable | Purpose | Location |
|--------|--------|---------|
| SFS_PAT | GitHub API + inter-service auth | GitHub Org → Secrets |
| JWT_SECRET | Auth token signing | GitHub / Replit Secrets |
| SYNC_TOKEN | Webhook authentication | GitHub / Replit Secrets |

---

## Platform / Infrastructure

| Variable | Purpose |
|--------|--------|
| DATABASE_URL | Primary database connection |
| CLIENT_URL | CORS / frontend origin |
| CORS_ORIGIN | Alternate CORS config |

---

## Stripe / Billing

| Variable | Purpose |
|--------|--------|
| STRIPE_SECRET_KEY | Server-side Stripe auth |
| STRIPE_PUBLIC_KEY | Client-side Stripe |
| STRIPE_WEBHOOK_SECRET | Webhook verification |

---

## Cloud / Storage

| Variable | Purpose |
|--------|--------|
| AWS_ACCESS_KEY_ID | S3 access |
| AWS_SECRET_ACCESS_KEY | S3 secret |
| AWS_REGION | S3 region |
| AWS_S3_BUCKET | Asset storage |

---

## DNS / Domains

| Variable | Purpose |
|--------|--------|
| CLOUDFLARE_API_TOKEN | DNS automation |
| CLOUDFLARE_ZONE_ID | Zone targeting |

---

## Rules (Non-Negotiable)

- ❌ No secrets in git history
- ❌ No real values in `.env.example`
- ✅ GitHub Org Secrets = source of truth
- ✅ Replit Secrets mirror production
- 🔁 Rotate immediately if exposure is suspected

