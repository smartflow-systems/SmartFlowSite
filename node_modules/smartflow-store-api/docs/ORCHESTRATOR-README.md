# SFS Multi-Agent Orchestrator

**SmartFlowSite is now the Master Brain** - Complete multi-agent orchestration system for coordinating Claude, ChatGPT, and custom agents across all SFS applications.

---

## 🧠 What Is This?

The SFS Orchestrator is a **unified control system** that:

- **Coordinates** multiple AI agents (Claude, ChatGPT, custom)
- **Manages** complex multi-step workflows
- **Synchronizes** context and state between platforms
- **Packages** capabilities into reusable bundles
- **Scales** effortlessly as you add apps and tools

Think of it as **the nervous system for your AI ecosystem**.

---

## 🚀 Quick Start

### 1. Start the Orchestrator

**Where to run:** Replit Shell or Terminal

```bash
npm run orchestrator
```

The orchestrator will start on port **5001** (default).

You should see:
```
╔════════════════════════════════════════════════════╗
║  🧠 SFS ORCHESTRATOR RUNNING                      ║
╠════════════════════════════════════════════════════╣
║  URL: http://localhost:5001                        ║
║  Agents: 5                                         ║
║  Packages: 3                                       ║
║  Connectors: 3                                     ║
╚════════════════════════════════════════════════════╝
```

### 2. Open the Dashboard

**Where:** Browser

Visit: **http://localhost:5001**

You'll see:
- Real-time agent status
- Active workflows
- Package catalog
- System stats

### 3. Use the CLI

**Where to run:** Replit Shell

```bash
# List all agents
npm run agent -- agent list

# List packages
npm run agent -- package list

# Execute a package
npm run agent -- package execute smart-starter

# Show orchestrator status
npm run agent -- status
```

---

## 📁 Architecture Overview

```
SmartFlowSite (Control Hub)
├── .sfs/
│   ├── agents/          # Agent manifests (JSON configs)
│   ├── packages/        # Package definitions (bundled workflows)
│   ├── workflows/       # Workflow templates
│   └── state/           # Shared state storage
├── server/
│   ├── orchestrator/
│   │   ├── index.js             # Main orchestrator service
│   │   ├── registry.js          # Agent registry
│   │   ├── workflow-engine.js   # Workflow executor
│   │   ├── state-store.js       # State management
│   │   └── package-manager.js   # Package system
│   └── connectors/
│       ├── claude.js            # Claude integration
│       ├── chatgpt.js           # ChatGPT integration
│       └── base.js              # Base connector class
├── scripts/
│   ├── sfs-agent-cli.js         # CLI tool
│   └── sync-chatgpt-claude.js   # File sync service
└── public/
    └── dashboard/
        └── index.html           # Web dashboard
```

---

## 🤖 Agents

Agents are AI workers that perform specific tasks. Each agent has:

- **Platform:** Claude, ChatGPT, or custom
- **Capabilities:** What it can do
- **Context files:** Files it needs to access
- **Triggers:** Events that activate it

### Example Agent Manifest

**File:** `.sfs/agents/smartflow-theme-enforcer.json`

```json
{
  "agent_id": "smartflow-theme-enforcer",
  "platform": "claude",
  "capabilities": ["theme-application", "branding", "css-generation"],
  "apps": ["SmartFlowSite", "SFSAPDemoCRM"],
  "context_files": [
    "sfs-theme-config.json",
    "SFS-DESIGN-SYSTEM.md"
  ]
}
```

### Pre-Configured Agents

1. **smartflow-theme-enforcer** (Claude)
   - Applies black-brown-gold theme to web apps
   - Injects SFS branding

2. **chatgpt-content-creator** (ChatGPT)
   - Generates marketing content
   - Creates social media posts
   - SEO optimization

3. **repo-manager** (Custom)
   - Creates GitHub repos
   - Sets up CI/CD
   - Manages secrets

4. **documentation-writer** (Claude)
   - Generates READMEs
   - Creates API docs
   - Maintains changelogs

5. **ci-setup-agent** (Custom)
   - Configures GitHub Actions
   - Sets up deployment pipelines

---

## 📦 Packages

Packages bundle multiple agents into reusable workflows.

### Available Packages

#### 1. **smart-starter**
Complete setup for new SFS projects:
```bash
npm run agent -- package execute smart-starter
```

**What it does:**
1. Applies SFS theme
2. Generates documentation
3. Sets up CI/CD

**Required context:**
- `REPO_PATH`: Path to repository
- `WORKFLOW_TYPE`: node|python|docker
- `DEPLOY_TARGET`: replit|vercel|github-pages

#### 2. **full-client-onboard**
Complete client onboarding workflow:
```bash
npm run agent -- package execute full-client-onboard context.json
```

**Example context.json:**
```json
{
  "CLIENT_NAME": "Acme Corp",
  "CLIENT_DESCRIPTION": "B2B SaaS platform",
  "TARGET_AUDIENCE": "Enterprise businesses"
}
```

**What it does:**
1. Creates GitHub repo
2. Applies custom branding
3. Generates homepage content
4. Creates documentation
5. Sets up deployment

#### 3. **content-automation**
Automated content generation:
```bash
npm run agent -- package execute content-automation
```

**What it does:**
1. Generates blog post
2. Creates social media posts (Twitter, LinkedIn, Instagram)
3. Generates email campaign

---

## ⚙️ Workflows

Workflows are sequences of agent tasks with dependencies.

### Example: Client Onboarding Workflow

**File:** `.sfs/workflows/example-client-onboard.json`

```json
{
  "id": "client-onboard",
  "steps": [
    {
      "name": "create-repository",
      "agent": "repo-manager",
      "action": "create-from-template"
    },
    {
      "name": "apply-theme",
      "agent": "smartflow-theme-enforcer",
      "depends_on": ["create-repository"]
    },
    {
      "name": "setup-ci",
      "agent": "ci-setup-agent",
      "depends_on": ["apply-theme"]
    }
  ]
}
```

### Execute a Workflow

```bash
npm run agent -- workflow execute .sfs/workflows/example-client-onboard.json context.json
```

---

## 🔄 File Sync (ChatGPT ↔ Claude)

Keep your ChatGPT projects and Claude projects in sync.

### Configuration

**File:** `.sfs/agents/chatgpt-bridge.json`

```json
{
  "sync_interval": "5m",
  "chatgpt_projects": [
    {
      "project_id": "sfs-marketing-agent",
      "sync_files": [
        "docs/Memory-Baseline.md",
        "sfs-theme-config.json"
      ]
    }
  ]
}
```

### Manual Sync

```bash
npm run sync
```

### Auto-Sync (Watch Mode)

```bash
npm run sync:watch
```

This will automatically sync files every 5 minutes (configurable).

---

## 🌐 API Reference

### Base URL

```
http://localhost:5001/api
```

### Endpoints

#### Agents

```bash
# List all agents
GET /api/agents

# Get agent by ID
GET /api/agents/:agentId

# Register new agent
POST /api/agents/register
Body: {agent manifest JSON}

# Invoke agent
POST /api/agents/:agentId/invoke
Body: {action, input, context}

# Find agents by capability
GET /api/agents/capability/:capability
```

#### Workflows

```bash
# List workflows
GET /api/workflows

# Execute workflow
POST /api/workflows/execute
Body: {workflow definition + context}

# Get active workflows
GET /api/workflows/active
```

#### Packages

```bash
# List packages
GET /api/packages

# Get package info
GET /api/packages/:packageId

# Execute package
POST /api/packages/:packageId/execute
Body: {context}

# Get package dependencies
GET /api/packages/:packageId/dependencies
```

#### State

```bash
# Set state
POST /api/state/:namespace/:key
Body: {value, options}

# Get state
GET /api/state/:namespace/:key

# Get all in namespace
GET /api/state/:namespace
```

### Health Check

```bash
GET /health
```

---

## 💡 Common Use Cases

### 1. Onboard a New Client

```bash
# Create context file
cat > client-context.json << EOF
{
  "CLIENT_NAME": "StyleHub Salon",
  "CLIENT_DESCRIPTION": "Modern hair salon and beauty services",
  "TARGET_AUDIENCE": "Style-conscious professionals",
  "INDUSTRY": "Beauty & Wellness"
}
EOF

# Execute full onboarding package
npm run agent -- package execute full-client-onboard client-context.json
```

### 2. Apply Theme to Existing Project

```bash
# Create task file
cat > theme-task.json << EOF
{
  "action": "apply-theme",
  "input": {
    "repo_path": "/path/to/project",
    "theme_variant": "standard"
  }
}
EOF

# Invoke theme enforcer agent
npm run agent -- agent invoke smartflow-theme-enforcer theme-task.json
```

### 3. Generate Marketing Content

```bash
npm run agent -- package execute content-automation << EOF
{
  "TOPIC": "Introducing SmartFlow AI Assistant",
  "AUDIENCE": "Small business owners",
  "CTA": "Start your free trial"
}
EOF
```

### 4. Set Up New Repository

```bash
npm run agent -- package execute smart-starter << EOF
{
  "REPO_PATH": "/home/garet/new-project",
  "WORKFLOW_TYPE": "node",
  "DEPLOY_TARGET": "vercel"
}
EOF
```

---

## 🛠️ Creating Custom Agents

### 1. Create Agent Manifest

**File:** `.sfs/agents/my-custom-agent.json`

```json
{
  "agent_id": "my-custom-agent",
  "name": "My Custom Agent",
  "platform": "claude",
  "capabilities": ["data-processing", "analysis"],
  "apps": ["SmartFlowSite"],
  "context_files": ["docs/Memory-Baseline.md"],
  "inputs": {
    "data_source": "string",
    "output_format": "string"
  },
  "outputs": {
    "format": "json",
    "schema": {
      "processed_data": "object",
      "summary": "string"
    }
  }
}
```

### 2. Register Agent

```bash
npm run agent -- agent register .sfs/agents/my-custom-agent.json
```

### 3. Use Agent

```bash
npm run agent -- agent invoke my-custom-agent task.json
```

---

## 📦 Creating Custom Packages

### 1. Create Package Definition

**File:** `.sfs/packages/my-package.json`

```json
{
  "package_id": "my-package",
  "name": "My Custom Package",
  "version": "1.0.0",
  "description": "Custom workflow package",
  "agents": ["agent-1", "agent-2", "agent-3"],
  "workflow": [
    {
      "name": "step-1",
      "agent": "agent-1",
      "action": "process",
      "input": {"data": "${INPUT_DATA}"}
    },
    {
      "name": "step-2",
      "agent": "agent-2",
      "depends_on": ["step-1"],
      "input": {"result": "${step-1.result}"}
    }
  ],
  "required_context": ["INPUT_DATA"]
}
```

### 2. Execute Package

```bash
npm run agent -- package execute my-package context.json
```

---

## 🔐 Environment Variables

Create `.env` file (or use `.env.example`):

```bash
# API Keys
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx

# Orchestrator Config
ORCHESTRATOR_PORT=5001
ORCHESTRATOR_URL=http://localhost:5001

# Optional
SFS_PAT=github_pat_xxx
REPLIT_TOKEN=xxx
```

---

## 📊 Monitoring

### View Orchestrator Status

```bash
npm run agent -- status
```

### Check Active Workflows

```bash
curl http://localhost:5001/api/workflows/active | jq
```

### View Agent Stats

```bash
curl http://localhost:5001/api/agents/stats | jq
```

### Dashboard

Open browser: **http://localhost:5001**

Real-time dashboard shows:
- Agent statuses
- Active workflows
- Package execution
- System health

---

## 🐛 Troubleshooting

### Orchestrator won't start

```bash
# Check if port is already in use
lsof -i :5001

# Use different port
ORCHESTRATOR_PORT=5002 npm run orchestrator
```

### Agent invocation fails

```bash
# Check agent is registered
npm run agent -- agent list

# Verify connector is working
curl http://localhost:5001/api/connectors/test | jq
```

### File sync not working

```bash
# Check sync config
cat .sfs/agents/chatgpt-bridge.json

# Run manual sync with verbose logging
node scripts/sync-chatgpt-claude.js sync
```

---

## 📚 Next Steps

1. **Customize Your Agents**
   - Edit `.sfs/agents/*.json` manifests
   - Add your ChatGPT custom GPT IDs
   - Configure context files

2. **Create Workflows**
   - Design multi-step workflows
   - Chain agents together
   - Add conditional logic

3. **Build Packages**
   - Bundle common workflows
   - Create reusable templates
   - Share across SFS apps

4. **Extend Connectors**
   - Add new platforms (n8n, Zapier, etc.)
   - Implement custom integrations
   - Connect to external APIs

---

## 🎯 Architecture Benefits

✅ **Unified Control** - Single source of truth for all agents
✅ **Platform Agnostic** - Works with any AI platform
✅ **Scalable** - Add unlimited agents without complexity
✅ **Context Sharing** - All agents access shared knowledge
✅ **Workflow Automation** - Complex tasks run automatically
✅ **Package System** - Reusable capability bundles
✅ **Future-Proof** - Ready for new AI platforms

---

## 📝 Key Files Reference

| File | Purpose |
|------|---------|
| `server/orchestrator/index.js` | Main orchestrator service |
| `server/orchestrator/registry.js` | Agent registration system |
| `server/orchestrator/workflow-engine.js` | Workflow executor |
| `server/orchestrator/state-store.js` | Shared state storage |
| `server/orchestrator/package-manager.js` | Package system |
| `server/connectors/claude.js` | Claude integration |
| `server/connectors/chatgpt.js` | ChatGPT integration |
| `scripts/sfs-agent-cli.js` | CLI tool |
| `scripts/sync-chatgpt-claude.js` | File sync service |
| `.sfs/agents/*.json` | Agent manifests |
| `.sfs/packages/*.json` | Package definitions |
| `.sfs/workflows/*.json` | Workflow templates |

---

## 🤝 Contributing

Want to add a new agent or package?

1. Create manifest in `.sfs/agents/` or `.sfs/packages/`
2. Test with CLI: `npm run agent -- agent register`
3. Document in this README
4. Share with the team!

---

## 📞 Support

- **Documentation:** `docs/ORCHESTRATOR-README.md` (this file)
- **API Docs:** `http://localhost:5001/health`
- **Dashboard:** `http://localhost:5001`
- **Issues:** Create GitHub issue in SmartFlowSite repo

---

**Built with 🧠 by SmartFlow Systems**

*Making AI orchestration simple, powerful, and scalable.*
