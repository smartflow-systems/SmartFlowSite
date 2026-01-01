# SFS Orchestrator - Package Usage Guide

## Your Available Packages

You now have **4 powerful packages** ready to automate your workflows:

---

## 1. app-launch-complete

**Complete App Launch Package** - End-to-end app launch automation

### What it does:
1. Creates GitHub repository from template
2. Applies SmartFlow branding and theme
3. Generates landing page content
4. Creates comprehensive documentation
5. Sets up CI/CD pipeline
6. Finalizes launch with final checks

### Required Context:
- `APP_NAME` - Name of your new app
- `APP_DESCRIPTION` - What your app does
- `TARGET_AUDIENCE` - Who will use it

### How to use:

```bash
# Create context file
cat > my-app-context.json << 'EOF'
{
  "APP_NAME": "SalonBookingApp",
  "APP_DESCRIPTION": "Online booking system for hair salons",
  "TARGET_AUDIENCE": "Salon owners and stylists"
}
EOF

# Execute package
npm run agent -- package execute app-launch-complete my-app-context.json
```

### What you get:
- New GitHub repository
- SmartFlow branding applied
- Landing page ready
- Documentation complete
- CI/CD configured
- Ready to deploy

---

## 2. smart-starter

**SmartStarter Package** - Quick project setup

### What it does:
1. Applies SmartFlow theme
2. Generates documentation
3. Sets up CI/CD

### Required Context:
- `REPO_PATH` - Path to your repository

### How to use:

```bash
cat > starter-context.json << 'EOF'
{
  "REPO_PATH": "/home/garet/SFS/MyNewProject"
}
EOF

npm run agent -- package execute smart-starter starter-context.json
```

---

## 3. full-client-onboard

**Full Client Onboarding Package** - Complete client setup

### What it does:
1. Creates client repository
2. Applies client-specific branding
3. Generates client content
4. Creates documentation
5. Sets up deployment

### Required Context:
- `CLIENT_NAME`
- `CLIENT_DOMAIN`
- `CLIENT_COLORS` (optional)

### How to use:

```bash
cat > client-context.json << 'EOF'
{
  "CLIENT_NAME": "Glow by Zara",
  "CLIENT_DOMAIN": "glowbyzara.com",
  "CLIENT_COLORS": {
    "primary": "#FF6B9D",
    "secondary": "#C44569"
  }
}
EOF

npm run agent -- package execute full-client-onboard client-context.json
```

---

## 4. content-automation

**Content Automation Package** - Marketing content generation

### What it does:
1. Generates blog posts
2. Creates social media content
3. Drafts email campaigns
4. Optimizes for SEO

### Required Context:
- `TOPIC` - What to write about
- `TONE` - professional/casual/friendly
- `PLATFORMS` - Array of platforms

### How to use:

```bash
cat > content-context.json << 'EOF'
{
  "TOPIC": "Benefits of AI automation for small businesses",
  "TONE": "professional",
  "PLATFORMS": ["blog", "twitter", "linkedin", "email"]
}
EOF

npm run agent -- package execute content-automation content-context.json
```

---

## Quick Commands Reference

### List all packages
```bash
npm run agent -- package list
```

### Get package details
```bash
npm run agent -- package info <package-id>
```

### Execute package
```bash
npm run agent -- package execute <package-id> <context-file.json>
```

### Check orchestrator status
```bash
npm run agent -- status
```

### View dashboard
```
http://localhost:5001
```

---

## Creating Your Own Context Files

All packages use JSON context files. Here's a template:

```json
{
  "VARIABLE_NAME": "value",
  "ANOTHER_VAR": "another value",
  "NESTED": {
    "key": "value"
  },
  "ARRAY": ["item1", "item2"]
}
```

Variables are substituted in the workflow using `${VARIABLE_NAME}` syntax.

---

## Common Workflows

### Launch a new SFS app
```bash
# Use app-launch-complete
npm run agent -- package execute app-launch-complete my-app.json
```

### Set up existing project
```bash
# Use smart-starter
npm run agent -- package execute smart-starter project.json
```

### Onboard new client
```bash
# Use full-client-onboard
npm run agent -- package execute full-client-onboard client.json
```

### Generate marketing content
```bash
# Use content-automation
npm run agent -- package execute content-automation content.json
```

---

## What's Running

```
Orchestrator: http://localhost:5001
Agents: 6
- smartflow-theme-enforcer (Claude)
- chatgpt-content-creator (ChatGPT)
- repo-manager (Custom)
- documentation-writer (Claude)
- ci-setup-agent (Custom)
- my-first-agent (Custom)

Packages: 4
Connectors: 3 (Claude, ChatGPT, Custom)
```

---

## Next Steps

1. **Try each package** - Test with sample contexts
2. **Create custom contexts** - For your specific needs
3. **Add more agents** - Extend the system
4. **Build new packages** - Combine agents in new ways

---

**Built for SmartFlow Systems**
Making AI orchestration simple and powerful
