# 🚀 SFS Orchestrator - Quick Start Guide

## What You Just Got

**SmartFlowSite is now your Master Brain** - a complete multi-agent orchestration system that coordinates all your AI agents (Claude, ChatGPT, custom bots) across all SFS applications.

---

## ⚡ 3-Minute Setup

### 1. Test the System

**Where to run:** Replit Shell

```bash
node scripts/test-orchestrator.js
```

You should see:
```
🎉 All tests passed!
```

### 2. Start the Orchestrator

```bash
npm run orchestrator
```

You'll see:
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

### 3. Open the Dashboard

**Browser:** http://localhost:5001

You'll see:
- 🤖 5 registered agents
- 📦 3 ready-to-use packages
- ⚙️ Real-time workflow monitoring

---

## 🎯 Try It Out

### List All Agents

```bash
npm run agent -- agent list
```

Output:
```
📋 Registered Agents (5)

🤖 smartflow-theme-enforcer
   Platform: claude
   Capabilities: theme-application, branding, css-generation

🤖 chatgpt-content-creator
   Platform: chatgpt
   Capabilities: content-generation, seo-optimization

... and 3 more
```

### Execute Your First Package

The **smart-starter** package sets up a complete SFS project:

```bash
# Create context file
cat > starter-context.json << 'EOF'
{
  "REPO_PATH": "/home/garet/test-project",
  "WORKFLOW_TYPE": "node",
  "DEPLOY_TARGET": "replit"
}
EOF

# Execute package
npm run agent -- package execute smart-starter starter-context.json
```

This will:
1. ✅ Apply SmartFlow theme (black-brown-gold)
2. ✅ Generate README documentation
3. ✅ Set up CI/CD pipeline

---

## 📦 Available Packages

### 1. **smart-starter** - Quick Project Setup
Sets up SFS theme + docs + CI for any project

```bash
npm run agent -- package execute smart-starter
```

### 2. **full-client-onboard** - Complete Client Setup
Creates repo, applies branding, generates content, sets up deployment

```bash
# Create client context
cat > client.json << 'EOF'
{
  "CLIENT_NAME": "Acme Corp",
  "CLIENT_DESCRIPTION": "B2B SaaS platform",
  "TARGET_AUDIENCE": "Enterprise businesses"
}
EOF

npm run agent -- package execute full-client-onboard client.json
```

### 3. **content-automation** - Marketing Content
Generates blog post + social media posts + email campaign

```bash
cat > content.json << 'EOF'
{
  "TOPIC": "AI-Powered Business Automation",
  "AUDIENCE": "Small business owners",
  "CTA": "Start your free trial"
}
EOF

npm run agent -- package execute content-automation content.json
```

---

## 🤖 Your Agents

### Claude Agents
1. **smartflow-theme-enforcer** - Applies SFS branding
2. **documentation-writer** - Generates docs

### ChatGPT Agents
3. **chatgpt-content-creator** - Creates marketing content

### Custom Agents
4. **repo-manager** - GitHub repo setup
5. **ci-setup-agent** - CI/CD configuration

---

## 🔄 File Sync (ChatGPT ↔ Claude)

Keep your ChatGPT projects synced with Claude:

```bash
# One-time sync
npm run sync

# Auto-sync (every 5 min)
npm run sync:watch
```

**Config:** `.sfs/chatgpt-bridge-config.json`

---

## 📊 Monitor Everything

### Dashboard
- **URL:** http://localhost:5001
- Real-time agent status
- Active workflow monitoring
- Package execution

### CLI Status
```bash
npm run agent -- status
```

### Health Check
```bash
curl http://localhost:5001/health | jq
```

---

## 💡 Common Workflows

### Setup a New SFS App

```bash
npm run agent -- package execute smart-starter << 'EOF'
{
  "REPO_PATH": "/path/to/new-app",
  "WORKFLOW_TYPE": "node",
  "DEPLOY_TARGET": "vercel"
}
EOF
```

### Onboard a Client

```bash
npm run agent -- package execute full-client-onboard << 'EOF'
{
  "CLIENT_NAME": "StyleHub",
  "CLIENT_DESCRIPTION": "Modern hair salon",
  "TARGET_AUDIENCE": "Style-conscious professionals"
}
EOF
```

### Generate Marketing Content

```bash
npm run agent -- package execute content-automation << 'EOF'
{
  "TOPIC": "SmartFlow AI Features",
  "AUDIENCE": "Tech-savvy business owners",
  "CTA": "Book a demo"
}
EOF
```

---

## 🛠️ Next Steps

### 1. **Customize Agents**
Edit agent manifests in `.sfs/agents/`

Example - Update theme enforcer:
```bash
nano .sfs/agents/smartflow-theme-enforcer.json
```

### 2. **Create Custom Packages**
Bundle agents into workflows:
```bash
nano .sfs/packages/my-custom-package.json
```

### 3. **Build Workflows**
Design multi-step processes:
```bash
nano .sfs/workflows/my-workflow.json
```

### 4. **Add Your ChatGPT Agents**
Update sync config:
```bash
nano .sfs/chatgpt-bridge-config.json
```

Add your custom GPT project IDs and files to sync.

---

## 📚 Full Documentation

**Complete guide:** `docs/ORCHESTRATOR-README.md`

Covers:
- Full API reference
- Creating custom agents
- Building complex workflows
- Troubleshooting
- Advanced features

---

## 🎨 What Makes This Special

✅ **Unified Control** - One system for all AI agents
✅ **Platform Agnostic** - Claude, ChatGPT, or custom
✅ **Context Sharing** - All agents know about SFS
✅ **Workflow Automation** - Chain complex tasks
✅ **Package System** - Reusable bundles
✅ **File Sync** - ChatGPT ↔ Claude bridge
✅ **Scalable** - Add unlimited agents/apps

---

## 🆘 Quick Troubleshooting

### Orchestrator won't start?
```bash
# Check port isn't in use
lsof -i :5001

# Use different port
ORCHESTRATOR_PORT=5002 npm run orchestrator
```

### Agent not found?
```bash
# List all agents
npm run agent -- agent list

# Re-register if needed
npm run agent -- agent register .sfs/agents/my-agent.json
```

### Sync not working?
```bash
# Check config
cat .sfs/chatgpt-bridge-config.json

# Run verbose sync
node scripts/sync-chatgpt-claude.js sync
```

---

## 🎯 Your Orchestration Hub

```
┌─────────────────────────────────────────────┐
│         SmartFlowSite (Master Brain)        │
│  ┌─────────────────────────────────────┐   │
│  │   SFS Orchestrator (Port 5001)      │   │
│  │   - 5 Agents                        │   │
│  │   - 3 Packages                      │   │
│  │   - 3 Connectors                    │   │
│  └─────────────────────────────────────┘   │
│            │         │         │            │
│            ▼         ▼         ▼            │
│       Claude    ChatGPT    Custom           │
│            │         │         │            │
│            └─────────┴─────────┘            │
│                     │                       │
│          All Your SFS Apps                  │
└─────────────────────────────────────────────┘
```

---

**Ready to orchestrate your AI empire! 🧠**

Questions? Check `docs/ORCHESTRATOR-README.md` for the full guide.
