# SocialScaleBooster - Replit Deployment Guide

**Updated:** 2025-12-13
**Status:** ✅ Ready for Replit deployment

---

## Quick Deployment

### 1. Import to Replit
1. Visit: https://replit.com/new/github/smartflow-systems/SocialScaleBooster
2. Click "Import from GitHub"
3. Repository will auto-configure using `.replit` file

### 2. Configure Secrets in Replit

Navigate to **Secrets tab** (🔒 icon in sidebar) and add:

#### Required Secrets
```env
# Database
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require

# Authentication
JWT_SECRET=your-secure-random-32-char-secret

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### Optional Secrets
```env
# Replit Deployment
REPLIT_TOKEN=<auto-provided-by-replit>
SFS_SYNC_URL=<your-webhook-url>

# Development
NODE_ENV=production
PORT=5000
```

**Generate JWT_SECRET:**
```bash
openssl rand -base64 32
```

---

## Environment Configuration

### Getting Database URL (Neon)

1. Visit: https://neon.tech
2. Create new project: "SocialScaleBooster Production"
3. Copy connection string from dashboard
4. Format: `postgresql://user:password@host.neon.tech/database?sslmode=require`

### Getting Stripe Keys

1. Visit: https://dashboard.stripe.com/apikeys
2. **For testing:** Use "Test mode" keys
3. **For production:** Switch to "Live mode" keys
4. Copy both Secret and Publishable keys

---

## Running on Replit

### Development Mode (with hot reload)
Click the **"Run"** button in Replit
- Runs: `npm run dev`
- Port: 5000
- Hot reload: ✅ Enabled (tsx watch)

### Production Mode
Use Shell:
```bash
npm start
```
- Runs: `tsx server/index.ts`
- Port: 5000
- Hot reload: ❌ Disabled

---

## First-Time Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Database Migrations
```bash
npm run migrate
```

This will:
- Generate Drizzle schema
- Push to Neon PostgreSQL database
- Create tables: `users`, `bots`, `botTemplates`, `analytics`

### 3. Start Server
```bash
npm run dev
```

### 4. Verify Health Check
Click the webview URL or visit:
```
https://your-repl.replit.dev/health
```

Expected response:
```json
{
  "ok": true
}
```

---

## Replit Configuration

### .replit File (Auto-configured)
```toml
modules = ["nodejs-20"]

[workflows]
runButton = "Project"

[[workflows.workflow]]
name = "Project"
[[workflows.workflow.tasks]]
task = "workflow.run"
args = "Server"

[[workflows.workflow]]
name = "Server"
[[workflows.workflow.tasks]]
task = "shell.exec"
args = "npm run dev"
waitForPort = 5000
```

### Ports
- **5000** - Main application (exposed as port 80)
- **Auto-proxied** to Replit public URL

---

## Testing the Deployment

### 1. Health Check
```bash
curl https://your-repl.replit.dev/health
# Response: {"ok": true}
```

### 2. Register User
```bash
curl -X POST https://your-repl.replit.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

Expected response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "isPremium": false,
    "botCount": 0
  }
}
```

### 3. Login
```bash
curl -X POST https://your-repl.replit.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### 4. Access Protected Route
```bash
curl https://your-repl.replit.dev/api/bots \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## GitHub Actions Integration

### Auto-Deploy on Push

The repository is configured for auto-deploy via GitHub Actions:

**Workflow:** `.github/workflows/sfs-deploy.yml`

**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**Process:**
1. Lint and type check
2. Run tests
3. Build application
4. Trigger Replit deployment (if `REPLIT_TOKEN` configured)

**GitHub Secrets Required:**
- `SFS_PAT` - ✅ Configured
- `REPLIT_TOKEN` - ✅ Configured
- `SFS_SYNC_URL` - Optional

---

## Monitoring & Logs

### View Logs in Replit
1. Click **Console** tab
2. See real-time server logs
3. Monitor requests and errors

### Log Levels
```
INFO  - Server started
DEBUG - API requests
ERROR - Failures and exceptions
```

### Useful Commands in Shell
```bash
# View recent logs
npm run dev 2>&1 | tail -100

# Check database connection
psql $DATABASE_URL

# View environment
env | grep -E "(DATABASE|JWT|STRIPE)"

# Restart server
Ctrl+C then npm run dev
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or restart Repl (Stop → Run)
```

### Database Connection Failed
**Check:**
1. `DATABASE_URL` is set in Secrets
2. Neon project is running (not paused)
3. Connection string includes `?sslmode=require`

**Test connection:**
```bash
psql $DATABASE_URL -c "SELECT 1;"
```

### JWT Errors
```bash
# Verify JWT_SECRET is set
echo $JWT_SECRET

# Should be 32+ characters
# If empty, add to Secrets tab
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Replit-Specific Issues

**Server won't start:**
- Check `.replit` file points to correct entry
- Verify Node version: `node --version` (should be 20+)
- Check package.json scripts exist

**Secrets not loading:**
- Restart Repl after adding secrets
- Verify secret names match exactly
- Check for trailing spaces in values

---

## Security Checklist

Before going live:

- [ ] Use production Stripe keys (not test keys)
- [ ] Set strong `JWT_SECRET` (32+ random characters)
- [ ] Enable SSL on Neon database (`?sslmode=require`)
- [ ] Review `.env.example` - ensure no secrets committed
- [ ] Enable Replit authentication (if private Repl)
- [ ] Set up Replit firewall rules (if available)
- [ ] Monitor Dependabot security alerts

---

## Production Recommendations

### Database
- ✅ Use Neon PostgreSQL (recommended)
- ✅ Enable connection pooling
- ✅ Set up automated backups
- ✅ Monitor query performance

### Monitoring
- Set up Sentry or similar for error tracking
- Enable Replit analytics
- Monitor GitHub Actions workflow runs
- Set up uptime monitoring (UptimeRobot, Pingdom)

### Performance
- Enable Replit Boosts for better performance
- Use CDN for static assets
- Implement caching (Redis) for frequent queries
- Monitor response times

---

## Useful Links

**Replit:**
- Dashboard: https://replit.com/~
- Docs: https://docs.replit.com

**Neon (Database):**
- Dashboard: https://console.neon.tech
- Docs: https://neon.tech/docs

**Stripe:**
- Dashboard: https://dashboard.stripe.com
- Test cards: https://stripe.com/docs/testing

**GitHub:**
- Repository: https://github.com/smartflow-systems/SocialScaleBooster
- Actions: https://github.com/smartflow-systems/SocialScaleBooster/actions
- Secrets: https://github.com/smartflow-systems/SocialScaleBooster/settings/secrets/actions

---

## Support

**Issues?**
- GitHub Issues: https://github.com/smartflow-systems/SocialScaleBooster/issues
- Replit Community: https://ask.replit.com

**Documentation:**
- README.md - Full project docs
- MODERNIZATION-SUMMARY.md - Recent changes
- QUICK-START.md - Quick reference

---

## ✅ Deployment Checklist

- [ ] Imported repo to Replit
- [ ] Added all required secrets
- [ ] Ran `npm install`
- [ ] Ran `npm run migrate`
- [ ] Started server with Run button
- [ ] Tested health check endpoint
- [ ] Registered test user
- [ ] Tested login
- [ ] Verified protected routes work
- [ ] Configured custom domain (optional)
- [ ] Set up monitoring
- [ ] Enabled GitHub auto-deploy

---

**Ready to deploy!** 🚀

All configuration is complete. Your SocialScaleBooster app will work on Replit with:
- TypeScript server (`npm run dev`)
- JWT authentication
- PostgreSQL database
- Stripe payments
- GitHub Actions CI/CD

**Last Updated:** 2025-12-13 by Claude Code
