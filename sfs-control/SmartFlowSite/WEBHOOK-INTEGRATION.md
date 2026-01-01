# GitHub → Replit Webhook Integration

## ✅ Integration Complete!

The GitHub webhook receiver has been successfully integrated into SmartFlowSite.

### Files Modified/Added:

1. **`replit-webhook-receiver.mjs`** - Webhook handler (NEW)
2. **`server.js`** - Updated to include webhook routes

### Webhook Endpoints:

- **POST** `/api/webhook/github-deploy` - Receives GitHub deployment webhooks
- **GET** `/api/webhook/ping` - Test endpoint to verify webhook receiver is running

### Environment Variables Required:

These should already be set in your Replit Secrets:

- `SFS_WEBHOOK_SECRET`: `fc6d45ac9bd6ee84086b408ac67f986e7c275305f067987d34e55a73c69908ea`
- `SFS_PAT`: `YOUR_GITHUB_PAT_HERE`

### GitHub Secrets Configured:

- ✅ `SFS_WEBHOOK_SECRET` - For signature verification
- ✅ `SFS_PAT` - For git operations
- ✅ `REPLIT_WEBHOOK_URL` - `https://smart-flow-site-Smart-F-Syst.replit.app/api/webhook/github-deploy`

### How It Works:

1. **Push to GitHub** (main branch)
2. **GitHub Actions workflow triggers** (`.github/workflows/deploy-to-replit.yml`)
3. **Workflow sends webhook** to your Replit app at `/api/webhook/github-deploy`
4. **Replit receives webhook**, verifies signature, and deploys:
   - Pulls latest code from GitHub
   - Installs dependencies (`npm install`)
   - Runs build (if configured)
   - Runs migrations (if configured)
   - Performs health check
   - Auto-restarts (Replit handles this)

### Testing the Integration:

#### Test 1: Ping Endpoint
```bash
curl https://smart-flow-site-Smart-F-Syst.replit.app/api/webhook/ping
```

Expected response:
```json
{
  "status": "ok",
  "message": "Replit webhook receiver is running",
  "timestamp": "2025-12-25T00:00:00.000Z"
}
```

#### Test 2: Deploy with Git Push
```bash
cd /home/garet/SFS/SmartFlowSite
git add .
git commit -m "Test webhook deployment"
git push origin main
```

Watch the GitHub Actions tab to see the workflow run!

### Troubleshooting:

**If webhook fails:**
1. Check Replit logs for error messages
2. Verify `SFS_WEBHOOK_SECRET` is set correctly in Replit Secrets
3. Check that the webhook URL in GitHub matches your Replit URL
4. Verify GitHub Actions workflow completed successfully

**If deployment fails:**
1. Check that `SFS_PAT` has correct permissions
2. Ensure git remote is configured correctly
3. Check Replit console for error messages

### Next Steps:

Deploy this updated server.js to Replit, then test by pushing a commit to GitHub!
