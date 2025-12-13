# Deploy SocialScaleBooster to Replit - RIGHT NOW

**5-Minute Deployment Guide**

---

## Step 1: Import Repository to Replit (1 min)

### Option A: Direct Import Link
**Click this link:** https://replit.com/new/github/smartflow-systems/SocialScaleBooster

### Option B: Manual Import
1. Go to https://replit.com
2. Click **"+ Create Repl"**
3. Choose **"Import from GitHub"**
4. Enter: `smartflow-systems/SocialScaleBooster`
5. Click **"Import from GitHub"**

✅ Replit will auto-configure using the `.replit` file

---

## Step 2: Configure Environment Secrets (2 min)

Click the **🔒 Secrets** tab in Replit sidebar and add these:

### Required Secrets (Must Have)

```env
DATABASE_URL=postgresql://[GET_FROM_NEON]
JWT_SECRET=[GENERATE_BELOW]
```

### How to Get Each Secret:

#### 1. DATABASE_URL (Neon PostgreSQL)
**Quick Setup:**
1. Visit: https://console.neon.tech/signup
2. Click **"Create Project"**
3. Name: "SocialScaleBooster Production"
4. Copy the connection string shown
5. Paste into Replit Secrets as `DATABASE_URL`

**Example format:**
```
postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

#### 2. JWT_SECRET (Generate Now)
**Option A: In Replit Shell**
```bash
openssl rand -base64 32
```
Copy output and paste into Replit Secrets as `JWT_SECRET`

**Option B: Use This Pre-Generated Secret (for testing only)**
```
k8n3jd92jd83ndk29dj3n9djn39djn3d93jd93
```

### Optional Secrets (Add Later)

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NODE_ENV=production
```

**Get Stripe keys later from:** https://dashboard.stripe.com/test/apikeys

---

## Step 3: Install & Setup (1 min)

In the Replit **Shell** tab, run:

```bash
# Install dependencies
npm install

# Setup database
npm run migrate
```

**Expected output:**
```
✓ Database schema created
✓ Tables: users, bots, botTemplates, analytics
```

---

## Step 4: Start Server (30 seconds)

Click the big **"Run"** button at the top

**What happens:**
- Runs `npm run dev`
- Starts TypeScript server
- Opens on port 5000
- Shows in webview

**Expected console output:**
```
serving on port 5000
```

---

## Step 5: Test It's Working (30 seconds)

### Test 1: Health Check
In the webview URL bar, you'll see something like:
```
https://socialscalebooster.yourname.repl.co
```

Add `/health` to the end:
```
https://socialscalebooster.yourname.repl.co/health
```

**Expected response:**
```json
{"ok": true}
```

✅ If you see this, the server is running!

### Test 2: Register a User
In Replit Shell:
```bash
curl -X POST https://socialscalebooster.yourname.repl.co/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@test.com",
    "password": "TestPass123!"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@test.com",
    "isPremium": false,
    "botCount": 0
  }
}
```

✅ If you see this, authentication is working!

---

## 🎉 You're Live!

Your app is now running at:
```
https://socialscalebooster.yourname.repl.co
```

### What Works:
✅ Health check endpoint
✅ User registration
✅ User login
✅ JWT authentication
✅ Protected bot routes
✅ Database connected

### What to Do Next:
1. **Save your Repl URL** - bookmark it
2. **Visit the frontend** - Go to your Repl URL
3. **Test the dashboard** - Login and create a bot
4. **Configure Stripe** (optional) - Add Stripe keys for payments

---

## Quick Commands Reference

### In Replit Shell:

```bash
# Restart server
npm run dev

# View logs
# (automatically shown in Console tab)

# Check database
npm run db:studio

# Run migrations
npm run migrate

# Install new packages
npm install package-name
```

---

## Troubleshooting

### Server Won't Start

**Error: "Port 5000 already in use"**
```bash
# Stop all processes
killall node

# Restart
npm run dev
```

**Error: "DATABASE_URL not found"**
- Go to 🔒 Secrets tab
- Add `DATABASE_URL` with your Neon connection string
- Click "Run" again

**Error: "JWT_SECRET required"**
- Go to 🔒 Secrets tab
- Add `JWT_SECRET` with a random 32-character string
- Click "Run" again

### Can't Connect to Database

**Check:**
1. Is your Neon project active? (visit https://console.neon.tech)
2. Does the connection string have `?sslmode=require` at the end?
3. Is the connection string in Secrets exactly as copied?

**Test connection:**
```bash
# In Replit Shell
echo $DATABASE_URL
# Should show: postgresql://...
```

### 404 Errors

**If `/health` returns 404:**
- Check Console tab for errors
- Restart the Repl (Stop → Run)
- Verify `npm run dev` is running

---

## Next Steps

### 1. Configure Custom Domain (Optional)
- Upgrade to Replit Hacker plan
- Add custom domain in Repl settings
- Point DNS to Replit

### 2. Add Stripe Payments
```env
# In Secrets tab
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_PUBLISHABLE_KEY=pk_test_51...
```

Get keys from: https://dashboard.stripe.com/test/apikeys

### 3. Monitor Performance
- Use Replit built-in monitoring
- Check Console tab for errors
- Monitor Database usage in Neon dashboard

### 4. Setup Auto-Deploy
- Already configured via GitHub Actions!
- Push to `main` branch = auto-deploy to Replit
- Requires `REPLIT_TOKEN` in GitHub secrets

---

## Emergency Contacts

**Something broken?**
- Check Console tab in Replit
- Review REPLIT-DEPLOYMENT.md for detailed troubleshooting
- GitHub Issues: https://github.com/smartflow-systems/SocialScaleBooster/issues

**Quick Links:**
- Replit Dashboard: https://replit.com/~
- Neon Dashboard: https://console.neon.tech
- GitHub Repo: https://github.com/smartflow-systems/SocialScaleBooster

---

## 🚀 Ready to Go!

**Total time:** ~5 minutes
**Status:** Production-ready
**Next:** Start building features!

---

**SmartFlow Systems** | Building the future of business automation

🤖 Generated with [Claude Code](https://claude.com/claude-code)
