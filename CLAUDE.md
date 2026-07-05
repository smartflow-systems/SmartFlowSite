# CLAUDE.md — AI Assistant Guide for SmartFlowSite

**Last Updated:** 2026-06-25 (policy alignment; previous update 2026-06-20)
**Version:** 1.1.0

---

## ⚠️ CURRENT CONTROL TOWER OVERRIDE — Read This First

**Status:** Updated 2026-06-25
**Authority:** SFS Control Tower (ChatGPT) / Garet

### SmartFlow Systems Current Mode

**AI Creator OS flagship build + ecosystem learning first.**

Default work makes the ecosystem working, understandable, safe, and well-structured.

Do not default to sales, outreach, revenue-first, launch, or demo mode unless Garet explicitly asks.

### SmartFlowSite Actual Role (current)

SmartFlowSite is a **docs / control / source-of-truth / support repo** for SmartFlow Systems.

It is **not** the ecosystem router, control brain, or multi-agent orchestration platform. The ChatGPT / SFS Control Tower is the actual decision and routing layer.

> **Conflict preserved:** Older sections of this file describe SmartFlowSite as the `"Master Brain"` and as a `"multi-agent orchestration platform"` coordinating all SFS products. That framing is **historical and stale.** It is annotated inline where it appears. Do not treat stale-labelled framing as active executor instructions.

### Agent Routing (current)

| Role | Agent | Scope |
|------|-------|-------|
| Main router and decision layer | **ChatGPT / SFS Control Tower** | Approves all task routes, modes, and safe next moves |
| Read-only planner, reviewer, repo mapper, risk checker, conflict checker, task briefer, memory-vault organiser | **Hermes** | Read-only only — does not execute unless memory-vault update approval is separately given |
| Preferred local executor for scoped repo patches | **Claude Code Local** | This repo only, exact approved scope, task by task |
| Executor after exact approved scope | **Codex Local / Codex Business Cloud** | Exact approved scope only |
| Support helper | **Grok Terminal** | Terminal-side output explanation and light analysis only |
| Support helper | **Notebook LLM** | Tables, repo maps, logs, and structured analysis only |
| Runtime / demo / deployment environment | **Replit** | Not the main planner or executor; push, sync, or deploy to Replit requires exact approval |

No agent self-assigns tasks, routes across repos, or becomes the ecosystem control brain. That role belongs to ChatGPT / SFS Control Tower.

### Approval Modes

#### READ-ONLY ONLY (default)

Allowed: Inspect safe, non-secret files and docs. Summarise, plan, review, map, create task briefs.

Not allowed: Edits, deletes, moves, file creation, git-changing commands, npm/pnpm/yarn installs or audit fixes, builds, tests, CI runs, deploys, migrations, database commands, external messages (Slack, email, GitHub issues/comments, webhooks), or secret-value inspection of any kind.

#### APPROVE MEMORY UPDATE ONLY

Allowed: Create or update approved markdown files or folders inside `/home/garet/personal-ai-stack/memory-vault` only.

Not allowed: Repo source code edits, git-changing commands, npm/pnpm/yarn, builds, tests, deploys, migrations, database commands, external messages, or secret-value inspection.

#### APPROVE WRITE

Allowed: Only within the exact repo, file, and scope stated in Garet's current task message.

Still not allowed without separate explicit approval: deploy, push, npm/pnpm/yarn install/build/test, migrations, database commands, secret-value inspection, destructive actions without an explicit scope and undo plan.

#### LET'S BASH

Allowed: Scoped Bash/WSL commands only, as stated in Garet's approved task.

Not allowed without separate explicit approval: destructive, irreversible, or broad commands; production-affecting commands; secret-handling or secret-value inspection; deploy, migration, or database commands; git-changing commands (push, pull, reset, clean, merge, rebase, commit, add); npm/pnpm/yarn installs, builds, tests, or audit fixes; external messages.

### Command Safety (current)

All command blocks in this file are **reference only.**

The following require **exact per-task approval** from Garet before execution:

- `npm`, `pnpm`, `yarn`, `npx` — install, audit fix, run, or any package manager operation
- `git push`, `git pull`, `git reset`, `git clean`, `git merge`, `git rebase`, `git commit`, `git add`
- Builds (`npm run build`, `vite build`, etc.)
- Tests (`npm test`, `vitest`, `jest`, etc.)
- Node scripts (`node scripts/*.js`, `npx prisma`, etc.)
- Deploys (Vercel, Replit, any platform)
- Migrations (`prisma migrate`, `npx prisma migrate`, etc.)
- Database commands
- `curl` or HTTP mutation calls (POST, PUT, DELETE, PATCH to any endpoint)
- `kill`, `lsof`, `rm`, or other process/file-management commands
- `tail -f` or reading production/server logs
- External messages (Slack, email, GitHub PR/issue/comment, webhooks)

### Secret Safety (current)

Secret names and secret variable names are acceptable context.

**Secret values are never okay.**

Do not inspect, print, copy, summarise, store, import, or expose secret values.

Do not open the following unless Garet gives separate explicit secret-handling approval:
- `.env` or `.env.*` files
- Auth files (`auth.json`, `.credentials.json`, etc.)
- Private keys or certificates
- Token stores or API key files
- Cookies or session data
- Database dumps or connection strings containing credentials
- Production logs containing sensitive data
- Customer data, billing data, or lead records (`data/leads.json`, lead exports, etc.)
- Secret-heavy exports or JSONL session histories
- GitHub secrets or Replit environment values

### Customer and Lead Data (current)

Do not open, inspect, print, copy, summarise, or export the following without separate explicit approval:
- `data/leads.json` or any lead/customer data file
- Lead capture exports or CRM exports
- Billing records or payment data
- Production logs containing customer data
- Database dumps or backups containing customer records

### Git Workflow (current)

**Do not push directly to `main` by default.**

Prefer branch/PR flow for all changes. Direct push to `main` is only allowed when Garet explicitly approves it for a specific task.

> **Conflict preserved:** The Git Workflow section below states `"IMPORTANT: This project uses direct push to main (no PR required for solo development)."` That instruction is **stale** and overridden by current policy. It is annotated below and preserved for historical record.

---

## Stop Condition

After any approved task, the executor must report:

1. What was checked or changed
2. Exact files touched (or confirmed untouched)
3. Commands run, if any
4. Risks or blockers
5. Next safest action
6. Confirmation no secrets were inspected or exposed
7. Confirmation no git/npm/pnpm/yarn/build/test/deploy/migration/database/external-message commands were run unless explicitly approved in the task

For file-creation tasks only, also report:
- File created and exact path

---

## Table of Contents

1. [Project Overview](#project-overview) — historical reference
2. [Codebase Architecture](#codebase-architecture) — historical reference
3. [Directory Structure](#directory-structure)
4. [Tech Stack](#tech-stack)
5. [Development Workflows](#development-workflows) — reference only
6. [Security Practices](#security-practices)
7. [Agent System](#agent-system) — historical reference
8. [API Reference](#api-reference) — reference only
9. [Common Tasks](#common-tasks) — historical reference
10. [Key Conventions](#key-conventions)
11. [Important Files Reference](#important-files-reference)
12. [Troubleshooting](#troubleshooting) — reference only

---

## Project Overview

> **⚠️ STALE FRAMING** — "Master Brain" and "multi-agent orchestration platform" are historical labels. SmartFlowSite's current role is docs/control/source-of-truth/support. The ChatGPT / SFS Control Tower is the actual ecosystem router and decision layer. See "Current Control Tower Override" above.

SmartFlowSite was originally designed as a multi-agent orchestration platform coordinating AI agents across multiple SmartFlow Systems applications. That architectural role is stale. SmartFlowSite currently serves as the SFS site, orchestrator reference code, and CI tooling host.

**Historical product scope (stale reference only):**
- SocialScaleBooster — social media content generation
- SFS AP-CRM — appointment and customer relationship management
- SFS Data Query Engine — data analysis and reporting

### Key Principles (preserved from original)

- Platform Agnostic: agents work across Claude, ChatGPT, or custom implementations
- Security First: path traversal protection, input sanitization, rate limiting
- Stateful Workflows: context flows between steps with variable resolution
- Extensible Design: easy to add new agents, connectors, and workflows

---

## Codebase Architecture

> **⚠️ STALE LABEL** — The diagram below labels this service as "Master Brain." That label is historical and does not reflect the current Control Tower routing. See "Current Control Tower Override" above.

SmartFlowSite follows a hybrid monolith + microservices pattern with an orchestrator-based architecture.

```
┌─────────────────────────────────────────────────────────────┐
│         SmartFlowSite (historical label: "Master Brain")    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SFS Orchestrator (Port 5001)                        │  │
│  │  ├─ Agent Registry (manage agents)                   │  │
│  │  ├─ Workflow Engine (multi-step workflows)           │  │
│  │  ├─ Package Manager (bundled capabilities)           │  │
│  │  └─ State Store (persistent context)                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│        ┌──────────────────┼──────────────────┐             │
│        │                  │                  │              │
│    ┌───▼────┐      ┌─────▼──────┐    ┌─────▼────┐         │
│    │ Claude │      │   ChatGPT  │    │ Custom   │         │
│    │Connector│     │ Connector  │    │Connector │         │
│    └────────┘      └────────────┘    └──────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Layers

1. **Frontend Layer** (`public/`)
   - Static HTML/CSS/JS (vanilla JavaScript, no framework)
   - Lead capture forms, pricing pages, landing pages
   - Dashboard UI for orchestrator monitoring

2. **API Gateway Layer** (`server.js`, `gateway/`)
   - Express.js HTTP server (port 5000)
   - JWT authentication middleware
   - Security middleware (Helmet, CORS, rate limiting)
   - Lead capture and Stripe integration endpoints

3. **Orchestrator Layer** (`server/orchestrator/`)
   - Core orchestration service (port 5001)
   - Agent registry and lifecycle management
   - Workflow engine with dependency resolution
   - State store with namespace isolation
   - Package manager for bundled capabilities

4. **Connector Layer** (`server/connectors/`)
   - Platform abstraction (Claude, ChatGPT, custom)
   - Unified invocation interface
   - Error handling and retry logic
   - API key management

5. **Data Layer**
   - File-based JSON storage (`data/leads.json`, `.sfs/state/`)
   - Optional Prisma ORM (configured but minimal)
   - Optional MongoDB support

---

## Directory Structure

```
/home/user/SmartFlowSite/
│
├── .sfs/                          # SmartFlow Systems Configuration
│   ├── agents/                    # Agent manifests (7 agents)
│   │   ├── smartflow-theme-enforcer.json
│   │   ├── chatgpt-content-creator.json
│   │   ├── documentation-writer.json
│   │   ├── repo-manager.json
│   │   ├── ci-setup-agent.json
│   │   ├── sfs-memory-knowledge-agent.json
│   │   └── my-first-agent.json
│   ├── packages/                  # Package definitions (4 packages)
│   │   ├── smart-starter.json
│   │   ├── full-client-onboard.json
│   │   ├── content-automation.json
│   │   └── app-launch-complete.json
│   ├── workflows/                 # Workflow templates (2 workflows)
│   │   ├── daily-content-generation.json
│   │   └── example-client-onboard.json
│   ├── state/                     # Persistent state storage
│   │   └── *.json                 # Workflow and context state
│   └── config.json                # SFS configuration (repo, secrets)
│
├── server/                        # Backend Orchestration System
│   ├── orchestrator/
│   │   ├── index.js              # Main orchestrator (412 lines) - START HERE
│   │   ├── registry.js           # Agent registration and discovery
│   │   ├── workflow-engine.js    # Workflow executor (375 lines)
│   │   ├── state-store.js        # State persistence (file-based)
│   │   └── package-manager.js    # Package composition system
│   ├── connectors/
│   │   ├── base.js               # BaseConnector abstract class
│   │   ├── claude.js             # Claude API/CLI integration
│   │   ├── chatgpt.js            # OpenAI ChatGPT integration
│   │   └── connector-manager.js  # Connector registry
│   ├── middleware/
│   │   └── security.ts           # Security middleware (Helmet, CORS, rate limit)
│   └── utils/
│       ├── log-sanitizer.js      # XSS prevention for logs
│       └── log-sanitizer.mjs     # ESM version
│
├── gateway/                       # API Gateway Layer
│   └── middleware/
│       └── auth.ts               # JWT authentication middleware
│
├── public/                        # Static Frontend Files
│   ├── index.html                # Main landing page
│   ├── dashboard/
│   │   └── index.html            # Orchestrator dashboard
│   ├── site.config.json          # Site configuration
│   ├── pricing.json              # Pricing plans data
│   ├── app.js                    # Frontend logic (286 lines)
│   ├── leads.html                # Lead capture form
│   ├── admin.html                # Admin interface
│   ├── assets/                   # CSS, JS, images
│   └── [other static pages]
│
├── scripts/                       # Automation and CLI Tools
│   ├── sfs-agent-cli.js          # CLI for agent management (650+ lines)
│   ├── sync-chatgpt-claude.js    # Cross-platform file sync
│   ├── test-orchestrator.js      # Orchestrator test suite
│   ├── deploy.sh                 # Deployment automation
│   └── [other scripts]
│
├── .github/                       # GitHub Actions & CI/CD
│   ├── workflows/
│   │   ├── sfs-ci-deploy.yml     # Reusable deployment workflow
│   │   ├── sfs-ci.yml            # Main CI pipeline
│   │   ├── security-scan.yml     # CodeQL security analysis
│   │   └── [other workflows]
│   └── codeql/
│       └── codeql-config.yml     # Security scanning config
│
├── docs/                          # Documentation
│   ├── ORCHESTRATOR-README.md    # Complete orchestrator guide
│   ├── CI-HowTo.md               # CI/CD documentation
│   ├── How-We-Use-ChatGPT.md    # ChatGPT integration guide
│   └── [other docs]
│
├── app/                           # Next.js/Modern App Structure
│   └── api/
│       └── gh-sync/
│           └── route.js          # GitHub webhook handler
│
├── server.js                     # Main Express app (207 lines)
├── package.json                  # Node.js dependencies
├── schema.prisma                 # Prisma ORM schema
├── .env.example                  # Environment variable template (names only)
├── .replit                       # Replit configuration
├── vercel.json                   # Vercel deployment config
├── AGENTS.md                     # AI agent guidelines
└── LICENSE                       # Project license
```

---

## Tech Stack

### Backend
- **Node.js** >=18 (ES Modules)
- **Express.js** ^4.21.2 (HTTP server)
- **Prisma** ^5.22.0 (ORM — minimal usage)

### Authentication & Security
- **jsonwebtoken** ^9.0.2 (JWT authentication)
- **bcryptjs** ^2.4.3 (Password hashing)
- **Helmet** ^8.1.0 (Security headers)
- **express-rate-limit** ^8.2.1 (Rate limiting)
- **CORS** ^2.8.5 (Cross-origin resource sharing)

### External APIs
- **Stripe** ^16.12.0 (Payment processing)
- **Axios** ^1.13.1 (HTTP client)
- **Claude API** (via Anthropic SDK)
- **OpenAI API** (ChatGPT-4o)

### Frontend
- Vanilla JavaScript (no framework)
- HTML5 + CSS3
- Glassmorphism design patterns

### DevOps
- **GitHub Actions** (CI/CD)
- **CodeQL** (Security scanning)
- **Replit** (Development environment)
- **Vercel** (Deployment option)

---

## Development Workflows

> **⚠️ REFERENCE ONLY — do not run any command in this section without explicit approval from Garet / Control Tower for that exact repo and task.**

### Local Development

```bash
# Start main server (port 5000)
npm start
# or
npm run dev

# Start orchestrator service (port 5001)
npm run orchestrator

# Use agent CLI
npm run agent -- agent list
npm run agent -- package list
npm run agent -- package execute smart-starter

# File synchronization (ChatGPT ↔ Claude)
npm run sync              # One-time sync
npm run sync:watch        # Watch mode

# Database management
npm run migrate           # Run Prisma migrations
npm run studio            # Open Prisma Studio
```

### Git Workflow

~~**IMPORTANT**: This project uses **direct push to `main`** (no PR required for solo development).~~

> **⚠️ STALE — Overridden:** Prefer branch/PR flow for all changes. Direct push to `main` is only allowed when Garet explicitly approves it for a specific task. See "Current Control Tower Override" above.

```bash
# Reference only — do not run without approval
# Commit format: <type>: <description>
git add .
git commit -m "feat: add new agent capability"
git push
```

**Commit Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### Branch Strategy

- **Main Branch**: `main` (production)
- **Development Branch**: `dev` (optional)
- **Feature Branches**: `claude/claude-md-*` (AI assistant sessions)

### CI/CD Pipeline

> **⚠️ REFERENCE ONLY — do not trigger builds, tests, or deploys without approval.** The pipeline runs automatically on push to `main`. Since direct push to `main` now requires explicit Garet approval per task, confirm with Garet before any push that would trigger this pipeline.

CI/build/test status may be checked only when commands or GitHub checks are explicitly approved.

GitHub Actions runs automatically on push:

1. **Build**: Install dependencies (`npm install`)
2. **Test**: Run test suite (currently placeholder)
3. **Security Scan**: CodeQL analysis
4. **Deploy**: Automatic deployment to Replit/Vercel

**Key Workflows:**
- `.github/workflows/sfs-ci.yml` — Main CI pipeline
- `.github/workflows/security-scan.yml` — Security analysis
- `.github/workflows/sfs-ci-deploy.yml` — Reusable deployment

---

## Security Practices

### 1. Authentication & Authorization

**JWT Implementation** (`gateway/middleware/auth.ts`):

```typescript
// Request header format
Authorization: Bearer <JWT_TOKEN>

// Token payload
{
  userId: string,
  email: string,
  subscriptionTier: string
}

// Verification
jwt.verify(token, process.env.JWT_SECRET)
```

All protected API endpoints require a JWT token. Token expiration is enforced. Invalid tokens return 401 Unauthorized.

### 2. Security Middleware

**Implemented in** `server/middleware/security.ts`:

| Middleware | Configuration |
|------------|---------------|
| **Helmet** | CSP headers, clickjacking protection, MIME sniffing prevention |
| **CORS** | Whitelist: localhost:5000/5173/3000 (dev), FRONTEND_URL (prod) |
| **Rate Limiting** | API: 100 req/15min, Auth: 5 req/15min, Strict: 10 req/min |
| **Input Sanitization** | HTML entity encoding for XSS prevention |

### 3. Path Traversal Protection

**Critical security feature** implemented in:

- `server/orchestrator/registry.js` — `sanitizeAgentId()`
- `server/orchestrator/state-store.js` — `sanitizeNamespace()`
- `server/orchestrator/workflow-engine.js` — `getSafePath()`

**Pattern:**
```javascript
// Remove dangerous characters
const sanitized = input.replace(/[\.\/\\]/g, '');

// Validate resolved path stays within base directory
const resolved = path.resolve(baseDir, sanitized);
if (!resolved.startsWith(baseDir)) {
  throw new Error('Path traversal attempt detected');
}
```

### 4. Secret Management

**Environment variable names only** — secret values are never okay.

Known variable names (for reference/confirmation only — do not print or inspect values):

- `ANTHROPIC_API_KEY` — Claude API
- `OPENAI_API_KEY` — ChatGPT API
- `JWT_SECRET` — authentication
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY` — payment processing
- `MONGODB_URI` — database (optional)
- `GITHUB_USER`, `GH_TOKEN`, `SFS_PAT` — GitHub integration
- `REPLIT_TOKEN`, `SFS_SYNC_URL` — Replit/deployment

**Secret value guardrails:**

Do not inspect, print, copy, summarise, store, import, or expose secret values. Do not open `.env` or any file containing secret values. To confirm a secret is configured: check that the variable name appears in `.env.example` or the relevant platform's secrets UI — confirm name presence only, never print or read the value.

**NEVER commit secrets to version control.**

### 5. Input Validation & Sanitization

**Email Validation** (`server.js`):
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({ error: 'Invalid email format' });
}
```

**XSS Prevention** (`server/utils/log-sanitizer.js`):
```javascript
// HTML entity encoding
const sanitized = input.replace(/[<>&"']/g, char => htmlEntities[char]);
```

### 6. Known Security Issues

**GHSA-wj6h-64fc-37mp**: ECDSA Minerva timing attack
- **Status**: Mitigated
- **Solution**: Uses `cryptography` backend instead of raw `ecdsa`
- **Suppressed in**: `.github/codeql/codeql-config.yml`

---

## Agent System

> **⚠️ HISTORICAL REFERENCE — do not treat as active executor instructions.** This section documents the orchestration agent system as originally designed. It is retained as historical context only. Any agent invocation requires explicit per-task approval from Garet / the SFS Control Tower.

> **⚠️ CONTROL TOWER NOTE:** Registered Claude-based agents (`smartflow-theme-enforcer`, `documentation-writer`, `sfs-memory-knowledge-agent`) must not be invoked autonomously. Each invocation requires explicit approval from Garet / the SFS Control Tower for that specific task.

### Agent Manifest Structure

**Location**: `.sfs/agents/<agent-id>.json`

```json
{
  "agent_id": "unique-agent-id",
  "name": "Human Readable Name",
  "platform": "claude | chatgpt | custom",
  "capabilities": ["capability-1", "capability-2"],
  "apps": ["SmartFlowSite"],
  "description": "What this agent does",
  "inputs": { "param_name": "type" },
  "outputs": { "format": "json", "schema": { "result_field": "type" } },
  "dependencies": ["other-agent-id"],
  "metadata": { "version": "1.0.0", "author": "SFS Core Team" }
}
```

### Registered Agents

| Agent ID | Platform | Purpose |
|----------|----------|---------|
| `smartflow-theme-enforcer` | Claude | Apply SFS black/brown/gold theme |
| `chatgpt-content-creator` | ChatGPT | Marketing content (blog, social, email) |
| `documentation-writer` | Claude | Auto-generate README and docs |
| `repo-manager` | Custom | GitHub repo setup and CI config |
| `ci-setup-agent` | Custom | GitHub Actions workflow setup |
| `sfs-memory-knowledge-agent` | Claude | Knowledge base and memory management |
| `my-first-agent` | Custom | Template for custom agents |

### Workflow System (historical reference)

**Location**: `.sfs/workflows/<workflow-name>.json`

Workflows define multi-step processes with dependency management and variable resolution. Steps with `depends_on` wait for dependencies to complete; parallel execution occurs when no dependencies exist.

### Package System (historical reference)

| Package ID | Purpose | Est. Time |
|------------|---------|-----------|
| `smart-starter` | Quick project setup | 5–10 min |
| `full-client-onboard` | Complete client onboarding | 20–25 min |
| `content-automation` | Marketing content | 5–10 min |
| `app-launch-complete` | End-to-end app launch | 25–30 min |

### State Management

**State Store** (`server/orchestrator/state-store.js`): File-based JSON storage (`.sfs/state/`), namespace isolation, TTL support, in-memory cache.

```javascript
// API (reference only)
POST /api/state/:namespace/:key   // Set state value
GET  /api/state/:namespace/:key   // Get state value
GET  /api/state/:namespace        // Get all state in namespace
```

---

## API Reference

> **⚠️ REFERENCE ONLY — endpoint paths and schemas for planning and code review only. Do not call mutation endpoints (POST, PUT, DELETE, PATCH) without explicit approval.**

### Main Server (port 5000)

```
GET  /health                    → { ok: true, site: "SmartFlowSite", status: "running" }
POST /api/leads                 → Lead capture
GET  /api/leads                 → List leads (do not open response data without approval)
POST /api/stripe/checkout       → Stripe checkout session
```

### Orchestrator Service (port 5001)

```
GET  /api/agents                    # List all agents
GET  /api/agents/:agentId           # Get agent details
POST /api/agents/register           # Register new agent
POST /api/agents/:agentId/invoke    # Execute agent
GET  /api/agents/stats              # Agent statistics

POST /api/workflows/execute         # Execute workflow
GET  /api/workflows                 # List all workflows
GET  /api/workflows/active          # Get active workflows

GET  /api/packages                  # List packages
POST /api/packages/:packageId/execute  # Execute package

GET  /api/connectors                # List connectors
GET  /api/connectors/test           # Test connectors

GET  /                              # Orchestrator dashboard UI
```

---

## Common Tasks

> **⚠️ HISTORICAL REFERENCE — all code blocks in this section are reference only and must not be executed without explicit per-task approval from Garet / the SFS Control Tower.**

### Add a New Agent

**File**: `.sfs/agents/my-new-agent.json`

```json
{
  "agent_id": "my-new-agent",
  "name": "My New Agent",
  "platform": "claude",
  "capabilities": ["capability-1"],
  "apps": ["SmartFlowSite"],
  "description": "What this agent does",
  "inputs": { "input_param": "string" },
  "outputs": { "format": "json", "schema": { "result": "string" } },
  "dependencies": [],
  "metadata": { "version": "1.0.0", "author": "Your Name" }
}
```

Agents are auto-discovered from `.sfs/agents/` on orchestrator restart.

### Create a New Workflow

**File**: `.sfs/workflows/my-workflow.json`

```json
{
  "id": "my-workflow",
  "name": "My Custom Workflow",
  "steps": [
    {
      "name": "step-1",
      "agent": "my-new-agent",
      "input": { "param": "${INPUT_VAR}" },
      "output_to": "step1_result"
    },
    {
      "name": "step-2",
      "agent": "another-agent",
      "input": { "data": "${step1_result}" },
      "depends_on": ["step-1"]
    }
  ],
  "required_variables": ["INPUT_VAR"]
}
```

### Add a New API Endpoint

**Main Server** (`server.js`):

```javascript
app.post('/api/my-endpoint', async (req, res) => {
  try {
    const { param } = req.body;
    if (!param) {
      return res.status(400).json({ error: 'param is required' });
    }
    const result = await processData(param);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Integrate a New External API

**Create Connector** (`server/connectors/my-api.js`):

```javascript
import BaseConnector from './base.js';
import axios from 'axios';

export default class MyAPIConnector extends BaseConnector {
  constructor() {
    super('my-api', 'MyAPI');
  }

  async invoke(agentId, input) {
    try {
      const response = await axios.post(
        process.env.MY_API_URL,
        input,
        { headers: { 'Authorization': `Bearer ${process.env.MY_API_KEY}` } }
      );
      return { success: true, result: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testConnection() {
    return { success: true };
  }
}
```

### Add Security to an Endpoint

```javascript
import { authenticateToken } from '../gateway/middleware/auth.js';

app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});
```

---

## Key Conventions

### Brand Guidelines

**Colors:**
- **Black**: `#0D0D0D` (primary background)
- **Brown**: `#3B2F2F` (accents, borders)
- **Gold**: `#FFD700` (highlights, CTAs)

Brand rules must not override accessibility, readability, safety, disabled states, focus states, or semantic success/error/warning states.

**Design Patterns:** Glassmorphism (frosted glass), consistent spacing and typography, accessible contrast ratios.

### Code Style

**JavaScript/TypeScript:**
- ES Modules (`import`/`export`)
- Async/await for asynchronous operations
- Descriptive variable names (no abbreviations)
- Comments only for complex business logic

**TypeScript:** Strict mode enabled; type annotations for all function parameters.

### Naming Conventions

- **Files:** Kebab-case — `my-file-name.js`
- **Variables:** camelCase — `myVariable`; Constants — `UPPER_SNAKE_CASE`
- **Functions:** camelCase verbs — `getUser()`, `createAgent()`, `validateInput()`
- **API Endpoints:** RESTful, plural nouns — `/api/agents`, `/api/workflows`

### Error Handling

```javascript
try {
  const result = await riskyOperation();
  res.json({ success: true, data: result });
} catch (error) {
  console.error('[Context] Error:', error);
  res.status(500).json({
    error: 'Human-readable error message',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
```

**Logging:** Always sanitize logs (use `log-sanitizer.js`). Include context. Do not log or share secret values.

### Testing Standards

- Unit: test pure functions in isolation, mock external dependencies
- Integration: test API endpoints end-to-end, verify auth flows
- Security: path traversal, XSS, rate limiting, JWT validation

---

## Important Files Reference

### Essential Reading (Priority Order)

1. **`server/orchestrator/index.js`** (412 lines) — Main orchestrator; core architecture
2. **`AGENTS.md`** — AI assistant guidelines; read before any code changes
3. **`server/orchestrator/workflow-engine.js`** (375 lines) — Workflow execution with dependencies
4. **`.sfs/agents/*.json`** (7 files) — Agent manifest definitions
5. **`server/middleware/security.ts`** — Security middleware configuration
6. **`docs/ORCHESTRATOR-README.md`** — Complete orchestrator documentation

### Task-Specific Files

| Task | File(s) to Read/Edit |
|------|----------------------|
| Add new agent | `.sfs/agents/<agent-id>.json`, `server/orchestrator/registry.js` |
| Create workflow | `.sfs/workflows/<workflow-name>.json`, `server/orchestrator/workflow-engine.js` |
| Add API endpoint | `server.js` (main), `server/orchestrator/index.js` (orchestrator) |
| Fix security issue | `server/middleware/security.ts`, `gateway/middleware/auth.ts` |
| Integrate platform | `server/connectors/base.js`, `server/connectors/<platform>.js` |
| Configure CI/CD | `.github/workflows/sfs-ci.yml`, `.github/workflows/sfs-ci-deploy.yml` |
| Update branding | `public/assets/`, `.sfs/agents/smartflow-theme-enforcer.json` |
| Database schema | `schema.prisma` |

> **⚠️ Lead/customer data:** Do not open or inspect `data/leads.json`, lead exports, billing records, or customer data files unless Garet gives separate explicit approval.

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Node.js dependencies and scripts |
| `.env` | Environment variables — **do not open** |
| `.env.example` | Environment variable names only — safe to read |
| `.sfs/config.json` | SFS orchestrator configuration |
| `public/site.config.json` | Site metadata and feature flags |
| `schema.prisma` | Database schema (Prisma ORM) |
| `.replit` | Replit development environment config |
| `vercel.json` | Vercel deployment configuration |

---

## Troubleshooting

> **⚠️ REFERENCE ONLY — all commands in this section require explicit per-task approval before execution. Do not run shell commands, kill processes, tail logs, or call mutation endpoints without approval.**

### 1. Orchestrator Not Starting

**Symptoms:** Port 5001 not accessible, agents not loading.

**Debug approach (reference only — requires approval):**
```bash
# Check if port is in use
lsof -i :5001

# Kill existing process (requires explicit approval)
kill -9 <PID>

# Restart orchestrator (requires explicit approval)
npm run orchestrator
```

Check logs for: missing environment variable names, invalid agent manifests, file permission issues.

### 2. Agent Invocation Failing

**Symptoms:** 500 errors when calling `/api/agents/:agentId/invoke`

**Debug steps (read-only checks only unless approved):**
1. Confirm agent manifest exists at `.sfs/agents/<agent-id>.json`
2. Check connector config via `GET /api/connectors` (read-only)
3. Confirm API key variable names are set — do not print values

### 3. Workflow Execution Stuck

**Symptoms:** Workflow status remains "running", steps not completing.

**Debug steps:**
1. Check workflow state: `GET /api/state/workflow-<id>` (read-only)
2. Review dependency graph for circular dependencies
3. Check for missing required variables
4. Review `continue_on_error` settings in the workflow JSON

### 4. Path Traversal Errors

**Symptoms:** "Path traversal attempt detected" errors.

**Cause:** Agent ID, namespace, or file path contains `../` or invalid characters.

**Solution:**
- Use alphanumeric characters, hyphens, underscores only
- Avoid dots (`.`), slashes (`/`, `\`), and special characters
- Example: `my-agent-123` ✅, `../my-agent` ❌

### 5. Rate Limiting Issues

**Symptoms:** 429 Too Many Requests.

**Solution:**
- Wait for rate limit window to expire (15 minutes)
- Reduce request frequency
- For development, adjust limits in `server/middleware/security.ts` (requires APPROVE WRITE)

### 6. JWT Authentication Failures

**Symptoms:** 401 Unauthorized on protected endpoints.

**Debug steps:**
1. Confirm `JWT_SECRET` variable name is set — do not print its value
2. Check token format: `Authorization: Bearer <token>`
3. Verify token hasn't expired

### 7. Database Connection Issues

**Symptoms:** Prisma errors, MongoDB connection failures.

**Debug approach (reference only — requires approval):**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npm run migrate

# Open Prisma Studio
npm run studio
```

To confirm `MONGODB_URI` is configured: check that the variable name is present in `.env.example` or the platform secrets UI — do not print its value.

### 8. Lead Capture Not Working

**Symptoms:** POST /api/leads returns errors.

**Debug steps:**
1. Check email validation regex in `server.js`
2. Confirm `data/leads.json` exists and is writable — do not open or inspect its contents without approval
3. Check server logs for file-system errors — do not share log contents containing customer data
4. Validate request body format:
   ```json
   { "firstName": "John", "lastName": "Doe", "email": "john@example.com" }
   ```

---

## Quick Start Reference

> **⚠️ REFERENCE ONLY — do not execute any step without explicit approval from Garet / Control Tower for each action.**

When starting work on this codebase, read these files first:
- `AGENTS.md` — development standards
- `server/orchestrator/index.js` — architecture
- `.env.example` — environment variable names (names only; do not print values)

Commands below are reference only and require explicit approval:

```bash
npm install                       # requires approval
npm start                         # requires approval
npm run orchestrator              # requires approval (separate terminal)
curl http://localhost:5000/health # requires approval
curl http://localhost:5001/health # requires approval
```

---

**Last Updated:** 2026-06-25 (policy alignment update; previous: 2026-06-20 Control Tower Override added)
**Original Version Date:** 2025-11-30
**Maintained by:** SmartFlow Systems Core Team
**Version:** 1.1.0
