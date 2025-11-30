# CLAUDE.md - AI Assistant Guide for SmartFlowSite

**Last Updated:** 2025-11-30
**Version:** 1.0.0

This document provides comprehensive guidance for AI assistants working on the SmartFlowSite codebase. It covers architecture, conventions, workflows, and best practices.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Codebase Architecture](#codebase-architecture)
3. [Directory Structure](#directory-structure)
4. [Tech Stack](#tech-stack)
5. [Development Workflows](#development-workflows)
6. [Security Practices](#security-practices)
7. [Agent System](#agent-system)
8. [API Reference](#api-reference)
9. [Common Tasks](#common-tasks)
10. [Key Conventions](#key-conventions)
11. [Important Files Reference](#important-files-reference)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

SmartFlowSite is a **multi-agent orchestration platform** that coordinates AI agents (Claude, ChatGPT, custom) across multiple SmartFlow Systems applications. It serves as the "Master Brain" for:

- **SocialScaleBooster**: Social media content generation for service businesses
- **SFS AP-CRM**: Appointment and customer relationship management
- **SFS Data Query Engine**: Data analysis and reporting
- **SmartFlowSite**: Main website and orchestration hub

### Core Capabilities

1. **Agent Orchestration**: Register, manage, and invoke AI agents across platforms
2. **Workflow Automation**: Execute multi-step workflows with dependency management
3. **Package System**: Bundle agents into reusable capabilities
4. **State Management**: Persist and share context between workflow steps
5. **Platform Connectors**: Abstract integration with Claude, ChatGPT, and custom platforms

### Key Principles

- **Platform Agnostic**: Agents work across Claude, ChatGPT, or custom implementations
- **Security First**: Path traversal protection, input sanitization, rate limiting
- **Stateful Workflows**: Context flows between steps with variable resolution
- **Extensible Design**: Easy to add new agents, connectors, and workflows

---

## 🏗️ Codebase Architecture

SmartFlowSite follows a **hybrid monolith + microservices** pattern with an orchestrator-based architecture.

```
┌─────────────────────────────────────────────────────────────┐
│                    SmartFlowSite (Master Brain)             │
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

## 📁 Directory Structure

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
├── .env.example                  # Environment variable template
├── .replit                       # Replit configuration
├── vercel.json                   # Vercel deployment config
├── AGENTS.md                     # AI agent guidelines
└── LICENSE                       # Project license
```

---

## 🛠️ Tech Stack

### Backend
- **Node.js** >=18 (ES Modules)
- **Express.js** ^4.21.2 (HTTP server)
- **Prisma** ^5.22.0 (ORM - minimal usage)

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

## 🔄 Development Workflows

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

**IMPORTANT**: This project uses **direct push to `main`** (no PR required for solo development).

```bash
# Commit format: <type>: <description>
git add .
git commit -m "feat: add new agent capability"
git push

# CI/CD runs automatically on push
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
- **Feature Branches**: `claude/claude-md-milv3lje08h3a7le-*` (AI assistant sessions)

### CI/CD Pipeline

GitHub Actions runs automatically on push:

1. **Build**: Install dependencies (`npm install`)
2. **Test**: Run test suite (currently placeholder)
3. **Security Scan**: CodeQL analysis
4. **Deploy**: Automatic deployment to Replit/Vercel

**Key Workflows:**
- `.github/workflows/sfs-ci.yml` - Main CI pipeline
- `.github/workflows/security-scan.yml` - Security analysis
- `.github/workflows/sfs-ci-deploy.yml` - Reusable deployment

---

## 🔒 Security Practices

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

**Usage:**
- All protected API endpoints require JWT token
- Token expiration is enforced
- Invalid tokens return 401 Unauthorized

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

- `server/orchestrator/registry.js` - `sanitizeAgentId()`
- `server/orchestrator/state-store.js` - `sanitizeNamespace()`
- `server/orchestrator/workflow-engine.js` - `getSafePath()`

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

**Environment Variables** (`.env`):

```bash
# AI Platform Keys
ANTHROPIC_API_KEY=<claude-api-key>
OPENAI_API_KEY=<chatgpt-api-key>

# Authentication
JWT_SECRET=<random-secret-key>

# Payment Processing
STRIPE_SECRET_KEY=<stripe-secret>
STRIPE_PUBLISHABLE_KEY=<stripe-public-key>

# Database (optional)
MONGODB_URI=<connection-string>

# GitHub Integration
GITHUB_USER=<github-username>
GH_TOKEN=<github-pat>
SFS_PAT=<github-pat-alternative>

# Replit/Deployment
REPLIT_TOKEN=<webhook-auth-token>
SFS_SYNC_URL=<sync-endpoint>
```

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

## 🤖 Agent System

### Agent Architecture

Agents are platform-agnostic AI workers that can be invoked via the orchestrator. Each agent has a JSON manifest defining its capabilities, inputs, outputs, and dependencies.

### Agent Manifest Structure

**Location**: `.sfs/agents/<agent-id>.json`

```json
{
  "agent_id": "unique-agent-id",
  "name": "Human Readable Name",
  "platform": "claude" | "chatgpt" | "custom",
  "capabilities": ["capability-1", "capability-2"],
  "apps": ["SmartFlowSite", "SFSAPDemoCRM"],
  "description": "What this agent does",
  "triggers": {
    "events": ["event.name"],
    "webhooks": ["/api/agents/<agent-id>/trigger"]
  },
  "context_files": ["file1.md", "config.json"],
  "inputs": {
    "param_name": "type (string, array, object)"
  },
  "outputs": {
    "format": "json",
    "schema": {
      "result_field": "type"
    }
  },
  "dependencies": ["other-agent-id"],
  "metadata": {
    "version": "1.0.0",
    "author": "SFS Core Team",
    "last_updated": "2025-01-15"
  }
}
```

### Registered Agents

| Agent ID | Platform | Capabilities | Purpose |
|----------|----------|--------------|---------|
| `smartflow-theme-enforcer` | Claude | theme-application, branding, css-generation | Apply SFS black/brown/gold theme |
| `chatgpt-content-creator` | ChatGPT | content-generation, seo-optimization | Marketing content (blog, social, email) |
| `documentation-writer` | Claude | documentation, readme-generation | Auto-generate README and docs |
| `repo-manager` | Custom | github-operations, repo-creation | GitHub repo setup and CI config |
| `ci-setup-agent` | Custom | ci-cd, deployment-automation | GitHub Actions workflow setup |
| `sfs-memory-knowledge-agent` | Claude | knowledge-retrieval, context-building | Knowledge base and memory management |
| `my-first-agent` | Custom | general-purpose | Template for custom agents |

### Workflow System

Workflows define multi-step processes with dependency management and variable resolution.

**Location**: `.sfs/workflows/<workflow-name>.json`

```json
{
  "id": "workflow-id",
  "name": "Workflow Name",
  "description": "What this workflow does",
  "steps": [
    {
      "name": "step-name",
      "agent": "agent-id",
      "action": "action-name",
      "input": {
        "param": "${VARIABLE_NAME}"
      },
      "depends_on": ["previous-step"],
      "output_to": "context-key",
      "continue_on_error": false
    }
  ],
  "required_variables": ["VAR1", "VAR2"]
}
```

**Variable Resolution:**
```javascript
// Input: { topic: "${APP_NAME} overview" }
// Context: { APP_NAME: "SmartFlow CRM" }
// Resolved: { topic: "SmartFlow CRM overview" }
```

**Dependency Resolution:**
- Steps with `depends_on` wait for dependencies to complete
- Parallel execution when no dependencies exist
- Errors halt workflow unless `continue_on_error: true`

### Package System

Packages bundle multiple agents into reusable capabilities.

**Location**: `.sfs/packages/<package-name>.json`

| Package ID | Agents | Purpose | Est. Time |
|------------|--------|---------|-----------|
| `smart-starter` | theme-enforcer, docs-writer, ci-setup | Quick project setup | 5-10 min |
| `full-client-onboard` | repo-manager, theme-enforcer, content-creator, ci-setup | Complete onboarding | 20-25 min |
| `content-automation` | chatgpt-content-creator | Marketing content | 5-10 min |
| `app-launch-complete` | All agents | End-to-end app launch | 25-30 min |

**Execute a Package:**
```bash
npm run agent -- package execute smart-starter
```

### State Management

**State Store** (`server/orchestrator/state-store.js`):

- File-based JSON storage (`.sfs/state/`)
- Namespace isolation (e.g., `workflow-123/step-data`)
- TTL support (optional expiration)
- In-memory cache for performance

**API:**
```javascript
// Set state
POST /api/state/:namespace/:key
{ "value": "data" }

// Get state
GET /api/state/:namespace/:key

// Get all state in namespace
GET /api/state/:namespace
```

---

## 🌐 API Reference

### Main Server (port 5000)

**Health Check:**
```
GET /health
Response: { ok: true, site: "SmartFlowSite", status: "running" }
```

**Lead Capture:**
```
POST /api/leads
Body: {
  firstName: string,
  lastName: string,
  email: string,
  company?: string,
  phone?: string
}
Response: { id: string, status: string, message: string }
```

**Get All Leads:**
```
GET /api/leads
Response: { leads: Array<Lead> }
```

**Stripe Checkout (placeholder):**
```
POST /api/stripe/checkout
Body: { priceId: string, email?: string }
Response: { sessionId: string, url: string }
```

### Orchestrator Service (port 5001)

**Agent Operations:**
```
POST /api/agents/register              # Register new agent
GET  /api/agents                        # List all agents
GET  /api/agents/:agentId               # Get agent details
GET  /api/agents/capability/:capability # Find by capability
POST /api/agents/:agentId/invoke        # Execute agent
DELETE /api/agents/:agentId             # Unregister agent
GET  /api/agents/stats                  # Agent statistics
```

**Workflow Operations:**
```
POST /api/workflows/execute             # Execute workflow
GET  /api/workflows                     # List all workflows
GET  /api/workflows/active              # Get active workflows
POST /api/workflows                     # Save new workflow
```

**Package Operations:**
```
POST /api/packages/register                 # Register package
GET  /api/packages                          # List packages
GET  /api/packages/:packageId               # Get package details
POST /api/packages/:packageId/execute       # Execute package
GET  /api/packages/:packageId/dependencies  # Get dependencies
```

**State Operations:**
```
POST /api/state/:namespace/:key         # Set state value
GET  /api/state/:namespace/:key         # Get state value
GET  /api/state/:namespace              # Get all state
```

**Connector Operations:**
```
GET /api/connectors                     # List all connectors
GET /api/connectors/test                # Test all connectors
```

**Dashboard:**
```
GET /                                   # Orchestrator dashboard UI
GET /site                               # Main website redirect
```

---

## 📝 Common Tasks

### 1. Add a New Agent

**File**: `.sfs/agents/my-new-agent.json`

```json
{
  "agent_id": "my-new-agent",
  "name": "My New Agent",
  "platform": "claude",
  "capabilities": ["capability-1"],
  "apps": ["SmartFlowSite"],
  "description": "What this agent does",
  "inputs": {
    "input_param": "string"
  },
  "outputs": {
    "format": "json",
    "schema": {
      "result": "string"
    }
  },
  "dependencies": [],
  "metadata": {
    "version": "1.0.0",
    "author": "Your Name",
    "last_updated": "2025-11-30"
  }
}
```

**Register:**
```bash
# Agents are auto-discovered from .sfs/agents/
# Restart orchestrator to pick up new agent
npm run orchestrator
```

### 2. Create a New Workflow

**File**: `.sfs/workflows/my-workflow.json`

```json
{
  "id": "my-workflow",
  "name": "My Custom Workflow",
  "description": "Workflow description",
  "steps": [
    {
      "name": "step-1",
      "agent": "my-new-agent",
      "input": {
        "param": "${INPUT_VAR}"
      },
      "output_to": "step1_result"
    },
    {
      "name": "step-2",
      "agent": "another-agent",
      "input": {
        "data": "${step1_result}"
      },
      "depends_on": ["step-1"]
    }
  ],
  "required_variables": ["INPUT_VAR"]
}
```

**Execute:**
```bash
curl -X POST http://localhost:5001/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "workflow_id": "my-workflow",
    "context": { "INPUT_VAR": "test value" }
  }'
```

### 3. Add a New API Endpoint

**Main Server** (`server.js`):

```javascript
// Add after existing routes
app.post('/api/my-endpoint', async (req, res) => {
  try {
    const { param } = req.body;

    // Validate input
    if (!param) {
      return res.status(400).json({ error: 'param is required' });
    }

    // Process request
    const result = await processData(param);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

**Orchestrator** (`server/orchestrator/index.js`):

```javascript
// Add route in setupRoutes() method
this.app.post('/api/my-orchestrator-endpoint', async (req, res) => {
  try {
    // Implementation
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 4. Integrate a New External API

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
        {
          headers: {
            'Authorization': `Bearer ${process.env.MY_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        result: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async testConnection() {
    // Test API connectivity
    return { success: true };
  }
}
```

**Register Connector** (`server/connectors/connector-manager.js`):

```javascript
import MyAPIConnector from './my-api.js';

// Add to constructor
this.connectors.set('my-api', new MyAPIConnector());
```

### 5. Add Security to an Endpoint

**Use JWT Auth Middleware:**

```javascript
import { authenticateToken } from '../gateway/middleware/auth.js';

// Protected route
app.get('/api/protected', authenticateToken, (req, res) => {
  // req.user contains decoded JWT payload
  res.json({ user: req.user });
});
```

### 6. Run Tests

```bash
# Orchestrator tests
node scripts/test-orchestrator.js

# Agent tests
npm run agent -- test

# Placeholder (configure with your test framework)
npm test
```

---

## 🎨 Key Conventions

### Brand Guidelines

**Colors** (from `AGENTS.md`):
- **Black**: `#0D0D0D` (primary background)
- **Brown**: `#3B2F2F` (accents, borders)
- **Gold**: `#FFD700` (highlights, CTAs)

**Design Patterns**:
- Glassmorphism (frosted glass effect)
- Consistent spacing and typography
- Accessible contrast ratios

### Code Style

**JavaScript/TypeScript:**
- ES Modules (`import`/`export`)
- Async/await for asynchronous operations
- Descriptive variable names (no abbreviations)
- Comments only for complex business logic

**TypeScript:**
- Strict mode enabled
- Type annotations for all function parameters
- Interface definitions for data structures

**Python** (secondary language):
- Type hints for function signatures
- PEP 8 style guide
- Docstrings for public functions

### Naming Conventions

**Files:**
- Kebab-case: `my-file-name.js`
- Component files: `ComponentName.jsx`

**Variables:**
- camelCase: `myVariable`
- Constants: `UPPER_SNAKE_CASE`

**Functions:**
- camelCase: `myFunction()`
- Verbs: `getUser()`, `createAgent()`, `validateInput()`

**API Endpoints:**
- RESTful naming: `/api/resources`, `/api/resources/:id`
- Plural nouns: `/api/agents`, `/api/workflows`

### Error Handling

**Pattern:**
```javascript
try {
  // Operation
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

**Logging:**
- Always sanitize logs (use `log-sanitizer.js`)
- Include context in log messages
- Use appropriate log levels (error, warn, info, debug)

### Testing Standards

**Unit Tests:**
- Test pure functions in isolation
- Mock external dependencies
- Aim for >80% coverage

**Integration Tests:**
- Test API endpoints end-to-end
- Verify database interactions
- Test authentication flows

**Security Tests:**
- Path traversal attempts
- XSS injection attempts
- Rate limiting verification
- JWT token validation

---

## 📚 Important Files Reference

### Essential Reading (Priority Order)

1. **`server/orchestrator/index.js`** (412 lines)
   - **Purpose**: Main orchestrator service
   - **When to read**: Understanding core architecture
   - **Key concepts**: Agent registry, workflow engine, API routes

2. **`AGENTS.md`** (42 lines)
   - **Purpose**: AI assistant guidelines and standards
   - **When to read**: Before making any code changes
   - **Key concepts**: Brand guidelines, security practices, git workflow

3. **`server/orchestrator/workflow-engine.js`** (375 lines)
   - **Purpose**: Workflow execution with dependencies
   - **When to read**: Adding/debugging workflows
   - **Key concepts**: Variable resolution, dependency management, state persistence

4. **`.sfs/agents/*.json`** (7 files)
   - **Purpose**: Agent manifest definitions
   - **When to read**: Creating new agents or understanding capabilities
   - **Key concepts**: Agent schema, inputs/outputs, dependencies

5. **`server/middleware/security.ts`**
   - **Purpose**: Security middleware configuration
   - **When to read**: Adding endpoints, debugging auth issues
   - **Key concepts**: Rate limiting, CORS, input sanitization

6. **`docs/ORCHESTRATOR-README.md`**
   - **Purpose**: Complete orchestrator documentation
   - **When to read**: Learning orchestrator API and workflows
   - **Key concepts**: CLI usage, API reference, examples

### Task-Specific Files

| Task | File(s) to Read/Edit |
|------|----------------------|
| Add new agent | `.sfs/agents/<agent-id>.json`, `server/orchestrator/registry.js` |
| Create workflow | `.sfs/workflows/<workflow-name>.json`, `server/orchestrator/workflow-engine.js` |
| Add API endpoint | `server.js` (main), `server/orchestrator/index.js` (orchestrator) |
| Fix security issue | `server/middleware/security.ts`, `gateway/middleware/auth.ts` |
| Integrate platform | `server/connectors/base.js`, `server/connectors/<platform>.js` |
| Manage leads | `app.js` (frontend), `server.js` (backend), `data/leads.json` |
| Configure CI/CD | `.github/workflows/sfs-ci.yml`, `.github/workflows/sfs-ci-deploy.yml` |
| Update branding | `public/assets/`, `.sfs/agents/smartflow-theme-enforcer.json` |
| Database schema | `schema.prisma`, `schema.sql` |
| Environment setup | `.env.example`, `.replit`, `vercel.json` |

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Node.js dependencies and scripts |
| `.env` | Environment variables (NOT tracked) |
| `.env.example` | Environment variable template |
| `.sfs/config.json` | SFS orchestrator configuration |
| `public/site.config.json` | Site metadata and feature flags |
| `schema.prisma` | Database schema (Prisma ORM) |
| `.replit` | Replit development environment config |
| `vercel.json` | Vercel deployment configuration |

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Orchestrator Not Starting

**Symptoms**: Port 5001 not accessible, agents not loading

**Solutions:**
```bash
# Check if port is in use
lsof -i :5001

# Kill existing process
kill -9 <PID>

# Restart orchestrator
npm run orchestrator
```

**Check logs** for:
- Missing environment variables
- Invalid agent manifests
- File permission issues

#### 2. Agent Invocation Failing

**Symptoms**: 500 errors when calling `/api/agents/:agentId/invoke`

**Debug steps:**
1. Check agent manifest exists: `ls .sfs/agents/<agent-id>.json`
2. Verify connector is configured: `GET /api/connectors`
3. Test connector: `GET /api/connectors/test`
4. Check API keys in `.env`:
   - `ANTHROPIC_API_KEY` (Claude)
   - `OPENAI_API_KEY` (ChatGPT)

#### 3. Workflow Execution Stuck

**Symptoms**: Workflow status remains "running", steps not completing

**Debug steps:**
1. Check workflow state: `GET /api/state/workflow-<id>`
2. Review dependency graph for circular dependencies
3. Check for missing required variables
4. Review logs for step-level errors
5. Verify `continue_on_error` settings

#### 4. Path Traversal Errors

**Symptoms**: "Path traversal attempt detected" errors

**Cause**: Agent ID, namespace, or file path contains `../` or invalid characters

**Solution:**
- Use alphanumeric characters, hyphens, underscores only
- Avoid dots (`.`), slashes (`/`, `\`), and special characters
- Example: `my-agent-123` ✅, `../my-agent` ❌

#### 5. Rate Limiting Issues

**Symptoms**: 429 Too Many Requests

**Solution:**
- Wait for rate limit window to expire (15 minutes)
- Reduce request frequency
- Use caching where possible
- For development, adjust limits in `server/middleware/security.ts`

#### 6. JWT Authentication Failures

**Symptoms**: 401 Unauthorized on protected endpoints

**Debug steps:**
1. Verify `JWT_SECRET` is set in `.env`
2. Check token format: `Authorization: Bearer <token>`
3. Verify token hasn't expired
4. Test token decode:
   ```javascript
   const jwt = require('jsonwebtoken');
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
   console.log(decoded);
   ```

#### 7. Database Connection Issues

**Symptoms**: Prisma errors, MongoDB connection failures

**Solutions:**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npm run migrate

# Check MongoDB URI
echo $MONGODB_URI

# Test connection with Prisma Studio
npm run studio
```

#### 8. Lead Capture Not Working

**Symptoms**: POST /api/leads returns errors

**Debug steps:**
1. Check email validation regex
2. Verify `data/leads.json` exists and is writable
3. Check server logs for file system errors
4. Validate request body format:
   ```json
   {
     "firstName": "John",
     "lastName": "Doe",
     "email": "john@example.com"
   }
   ```

### Debug Tools

**Orchestrator Status:**
```bash
npm run agent -- status
```

**Agent List:**
```bash
npm run agent -- agent list
```

**Package List:**
```bash
npm run agent -- package list
```

**Test Orchestrator:**
```bash
node scripts/test-orchestrator.js
```

**View Logs:**
```bash
# Main server
tail -f logs/server.log

# Orchestrator
tail -f logs/orchestrator.log
```

**Health Checks:**
```bash
# Main server
curl http://localhost:5000/health

# Orchestrator
curl http://localhost:5001/health
```

---

## 🚀 Quick Start Checklist

When starting work on this codebase:

- [ ] Read `AGENTS.md` for development standards
- [ ] Review `server/orchestrator/index.js` for architecture
- [ ] Copy `.env.example` to `.env` and configure secrets
- [ ] Install dependencies: `npm install`
- [ ] Start main server: `npm start`
- [ ] Start orchestrator: `npm run orchestrator` (in separate terminal)
- [ ] Verify health: `curl http://localhost:5000/health`
- [ ] Test orchestrator: `curl http://localhost:5001/health`
- [ ] Review agent manifests in `.sfs/agents/`
- [ ] Explore dashboard: `http://localhost:5001`

---

## 📞 Need Help?

**Documentation:**
- `docs/ORCHESTRATOR-README.md` - Complete orchestrator guide
- `docs/CI-HowTo.md` - CI/CD documentation
- `docs/How-We-Use-ChatGPT.md` - ChatGPT integration guide

**GitHub:**
- Repository: https://github.com/boweazy/SmartFlowSite.git
- Issues: https://github.com/boweazy/SmartFlowSite/issues

**Key Contacts:**
- SFS Core Team (see agent manifests for authors)

---

**Last Updated:** 2025-11-30
**Maintained by:** SmartFlow Systems Core Team
**Version:** 1.0.0
