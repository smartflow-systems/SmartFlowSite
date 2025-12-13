# SFS Secrets Recovery - QUICK START
**Emergency Fix for 42 Broken Repositories**

---

## 🚨 Problem
Deleted GitHub secrets without replacement → All 42 SFS repos have broken CI/CD

---

## ✅ Solution (10 Minutes)

### Step 1: Generate New GitHub PAT (3 min)

1. Visit: **https://github.com/settings/tokens/new**

2. Fill in:
   - **Note:** `SFS CI/CD Token - Dec 2025`
   - **Expiration:** `90 days`
   - **Scopes:**
     ✅ `repo` (Full control of private repositories)
     ✅ `workflow` (Update GitHub Action workflows)
     ✅ `read:org` (Read org and team membership)

3. Click **"Generate token"**

4. **COPY THE TOKEN** - Format: `github_pat_xxxxxxxxxxxxxxxxxxxx...`
   - Store in password manager (1Password, Bitwarden, etc.)
   - DON'T close the page until saved!

---

### Step 2: Run Bulk Secrets Script (5 min)

```bash
# Navigate to SFS directory
cd "C:\Users\garet\OneDrive\Documents\01_Active_Projects\SFS"

# Run bulk secrets script
bash sfs-bulk-secrets-apply.sh
```

**When prompted:**
- `* SFS_PAT`: Paste your GitHub PAT from Step 1
- `REPLIT_TOKEN`: Press Enter to skip (optional)
- `SFS_SYNC_URL`: Press Enter to skip (optional)
- `Continue? (yes/no):` Type `yes`

**Script will:**
- Find all 42 repositories
- Apply `SFS_PAT` to each repo with GitHub Actions
- Show progress and summary

---

### Step 3: Verify (2 min)

```bash
# Check secrets are set
gh secret list --repo smartflow-systems/SocialScaleBooster

# Should show:
# SFS_PAT          Updated 2025-12-13

# Test a workflow
gh workflow run sfs-deploy.yml --repo smartflow-systems/SocialScaleBooster

# Check status
gh run list --repo smartflow-systems/SocialScaleBooster --limit 3
```

---

## 📊 What Gets Fixed

**42 Repositories:**
1. SocialScaleBooster
2. sfs-control-tower
3. SmartFlowSite-v2
4. sfs-url-shortener
5. sfs-business-suite
6. sfs-comms-hub
7. sfs-invoice-billing
8. Barber-booker-tempate-v1
9. sfs-analytics-engine
10. SFSDataQueryEngine
11. sfs-core-services
12. sfs-genesis-template
13. DataScrapeInsights
14. sfs-marketing-toolkit
15. WebsiteBuilder
16. sfs-knowledge-base
17. sfs-project-manager
18. sfs-video-platform
19. AICompanionBot
20. sfs-marketing-and-growth
21. sfs-white-label-dashboard
22. SocialScaleBoosterAIbot
23. SmartFlowSite
24. sfs-control-center
25. sfs-revenue-analytics
26. smartflow-theme-package
27. sfs-mobile-app
28. sfs-embed-sdk
29. sfs-design-system
30. sfs-deploy-hub
31. sfs-claude-skills
32. sfs-brand-assets
33. demo-repository
34. SmartFloiwSystems
35. SFSPersonalVPN
36. SFS-SocialPowerhouse
37. codegpt
38. SFSAPDemoCRM
39. SFS-SocialPowerhouseB
40. SFS-SocialPowerhouseS
41. sfs-theme-package
42. sfs-status-page

---

## 🔒 Save Your PAT Securely

**DO:**
✅ Store in password manager
✅ Add to encrypted notes
✅ Set calendar reminder for expiration (90 days)

**DON'T:**
❌ Save in plain text files
❌ Commit to repositories
❌ Share in Slack/Discord

---

## 🛠️ If Script Fails

**Permission Denied?**
```bash
# Verify GitHub CLI is authenticated
gh auth status

# Re-login if needed
gh auth login
```

**Repo Access Denied?**
- Check you're a member of `smartflow-systems` org
- Verify token has `repo` and `workflow` scopes
- Try setting secrets manually:
  ```bash
  gh secret set SFS_PAT --repo smartflow-systems/REPO_NAME
  ```

**Script Not Found?**
```bash
# Check location
ls -la "C:\Users\garet\OneDrive\Documents\01_Active_Projects\SFS\sfs-bulk-secrets-apply.sh"

# Make executable if needed
chmod +x "C:\Users\garet\OneDrive\Documents\01_Active_Projects\SFS\sfs-bulk-secrets-apply.sh"
```

---

## 📚 Additional Documentation

**Full Recovery Plan:**
`sfs-secrets-recovery-plan.md`

**Repository List:**
`SFS-REPOS-LIST.md`

**Individual Repo Secrets:**
```bash
# Set manually for one repo
gh secret set SFS_PAT --repo smartflow-systems/REPO_NAME
# Paste token when prompted
```

---

## ⏭️ After Recovery

1. **Test Random Repos:**
   ```bash
   gh workflow run --repo smartflow-systems/SmartFlowSite
   gh workflow run --repo smartflow-systems/sfs-control-center
   gh workflow run --repo smartflow-systems/sfs-business-suite
   ```

2. **Monitor Workflows:**
   - Visit: https://github.com/organizations/smartflow-systems/settings/actions
   - Check recent runs are passing

3. **Set Expiration Reminder:**
   - Calendar event 85 days from now
   - Title: "Renew SFS GitHub PAT"
   - Action: Repeat Steps 1-2

---

## 🆘 Emergency Contacts

**GitHub Support:** https://support.github.com
**Your Account:** boweazy
**Organization:** smartflow-systems
**CLI Status:** ✅ Authenticated

---

## ✨ Success Criteria

✅ New PAT generated and saved
✅ `sfs-bulk-secrets-apply.sh` runs successfully
✅ 40+ repos show success in script output
✅ `gh secret list` shows `SFS_PAT` in test repo
✅ GitHub Actions workflows pass

---

**Time to Fix:** ~10 minutes
**Repos Fixed:** 42
**Permanent Solution:** Password-managed PAT with 90-day rotation

---

**Ready? Run this now:**

```bash
cd "C:\Users\garet\OneDrive\Documents\01_Active_Projects\SFS"
bash sfs-bulk-secrets-apply.sh
```

**First, generate your PAT:**
👉 **https://github.com/settings/tokens/new**
