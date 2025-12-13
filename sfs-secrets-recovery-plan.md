# SFS Secrets Recovery Plan
**Date:** 2025-12-13
**Issue:** Deleted GitHub secrets without replacement - 40+ repos affected
**Status:** 🔴 CRITICAL - CI/CD pipelines broken

---

## Problem Summary

**What happened:**
- Deleted GitHub PAT and secrets from repositories
- Did not add new secrets before deletion
- ~40 SFS repositories now have broken CI/CD workflows

**Affected secrets:**
- `SFS_PAT` - GitHub Personal Access Token (repo + workflow scope)
- `REPLIT_TOKEN` - Replit deployment token (optional)
- `SFS_SYNC_URL` - Webhook URL for sync operations (optional)
- Possibly: `DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, etc.

---

## Current State

✅ **GitHub CLI authenticated** - `boweazy` account
✅ **Token scopes:** `gist`, `read:org`, `repo`, `workflow`
❌ **Repositories:** Missing critical secrets

---

## Recovery Steps

### Phase 1: Generate New Secrets (5 minutes)

#### 1.1 Create New GitHub PAT
```
1. Visit: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: "SFS CI/CD Token - 2025-12"
4. Expiration: 90 days (or No expiration for production)
5. Select scopes:
   ✓ repo (Full control of private repositories)
   ✓ workflow (Update GitHub Action workflows)
   ✓ read:org (Read org and team membership)
6. Click "Generate token"
7. COPY TOKEN IMMEDIATELY - shown only once
8. Save to password manager or secure location
```

**Token format:** `github_pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### 1.2 Generate Other Secrets (if needed)

**JWT Secret:**
```bash
openssl rand -base64 32
```

**Replit Token:**
- Log into Replit
- Account → Settings → API
- Generate new token if needed

**Stripe Keys:**
- Visit: https://dashboard.stripe.com/apikeys
- Use test keys: `sk_test_...` and `pk_test_...`

---

### Phase 2: Identify All SFS Repositories (10 minutes)

#### 2.1 List All Repos
```bash
# List all repos in smartflow-systems org
gh repo list smartflow-systems --limit 100 --json name,url > sfs-repos.json

# List all repos for boweazy user
gh repo list boweazy --limit 100 --json name,url >> sfs-repos.json

# View the list
cat sfs-repos.json
```

#### 2.2 Identify Repos with GitHub Actions
```bash
# Check which repos have workflows
for repo in $(gh repo list smartflow-systems --limit 100 --json nameWithOwner -q '.[].nameWithOwner'); do
  echo "Checking $repo..."
  gh api repos/$repo/actions/workflows --jq '.workflows[] | .path' 2>/dev/null || echo "  No workflows"
done > sfs-repos-with-workflows.txt
```

---

### Phase 3: Apply Secrets to All Repos (30 minutes)

#### 3.1 Bulk Apply Secrets Script

**[sfs-bulk-secrets-apply.sh]**

```bash
#!/usr/bin/env bash
set -euo pipefail

# SFS Bulk Secrets Application Script
# Applies secrets to all smartflow-systems and boweazy repos

echo "=============================================="
echo "SFS Bulk Secrets Recovery"
echo "=============================================="
echo ""

# Required secrets
read -sp "Enter SFS_PAT (GitHub PAT): " SFS_PAT
echo ""
read -sp "Enter REPLIT_TOKEN (or press Enter to skip): " REPLIT_TOKEN
echo ""
read -p "Enter SFS_SYNC_URL (or press Enter to skip): " SFS_SYNC_URL
echo ""

if [ -z "$SFS_PAT" ]; then
  echo "❌ SFS_PAT is required"
  exit 1
fi

# Get all repos
echo "📋 Fetching repository list..."
REPOS=$(gh repo list smartflow-systems --limit 100 --json nameWithOwner -q '.[].nameWithOwner')
REPOS+=$'\n'$(gh repo list boweazy --limit 100 --json nameWithOwner -q '.[].nameWithOwner')

echo "Found $(echo "$REPOS" | wc -l) repositories"
echo ""

success_count=0
error_count=0

# Apply secrets to each repo
for repo in $REPOS; do
  echo "Processing: $repo"

  # Apply SFS_PAT
  if gh secret set SFS_PAT --repo "$repo" --body "$SFS_PAT" 2>/dev/null; then
    echo "  ✅ Set SFS_PAT"
    ((success_count++))
  else
    echo "  ❌ Failed to set SFS_PAT"
    ((error_count++))
    continue
  fi

  # Apply REPLIT_TOKEN if provided
  if [ -n "$REPLIT_TOKEN" ]; then
    if gh secret set REPLIT_TOKEN --repo "$repo" --body "$REPLIT_TOKEN" 2>/dev/null; then
      echo "  ✅ Set REPLIT_TOKEN"
    else
      echo "  ⚠️  Failed to set REPLIT_TOKEN (may not have permissions)"
    fi
  fi

  # Apply SFS_SYNC_URL if provided
  if [ -n "$SFS_SYNC_URL" ]; then
    if gh secret set SFS_SYNC_URL --repo "$repo" --body "$SFS_SYNC_URL" 2>/dev/null; then
      echo "  ✅ Set SFS_SYNC_URL"
    else
      echo "  ⚠️  Failed to set SFS_SYNC_URL (may not have permissions)"
    fi
  fi

  echo ""
done

echo "=============================================="
echo "✅ Bulk secrets application complete!"
echo "=============================================="
echo "Success: $success_count repositories"
echo "Errors: $error_count repositories"
echo ""
```

#### 3.2 Targeted Approach (Manual)

For critical repos only:
```bash
# Set secrets for specific repo
gh secret set SFS_PAT --repo smartflow-systems/SocialScaleBooster
# Paste token when prompted

gh secret set REPLIT_TOKEN --repo smartflow-systems/SocialScaleBooster
# Paste token when prompted

gh secret set SFS_SYNC_URL --repo smartflow-systems/SocialScaleBooster
# Paste URL when prompted
```

---

### Phase 4: Verification (10 minutes)

#### 4.1 Check Secrets Are Set
```bash
# List secrets for a repo
gh secret list --repo smartflow-systems/SocialScaleBooster

# Should show:
# SFS_PAT          Updated 2025-12-13
# REPLIT_TOKEN     Updated 2025-12-13
# SFS_SYNC_URL     Updated 2025-12-13
```

#### 4.2 Verify CI/CD Works
```bash
# Trigger workflow manually
gh workflow run sfs-deploy.yml --repo smartflow-systems/SocialScaleBooster

# Check workflow status
gh run list --repo smartflow-systems/SocialScaleBooster --limit 5
```

#### 4.3 Bulk Verification Script

```bash
#!/usr/bin/env bash
# Check secrets across all repos

echo "Checking secrets for all SFS repos..."
for repo in $(gh repo list smartflow-systems --limit 100 --json nameWithOwner -q '.[].nameWithOwner'); do
  echo "---"
  echo "Repo: $repo"
  gh secret list --repo "$repo" 2>/dev/null || echo "  ❌ Cannot access secrets"
done
```

---

### Phase 5: Documentation (5 minutes)

#### 5.1 Create Secrets Inventory

**[sfs-secrets-inventory.md]**

| Secret Name | Purpose | Scope | Required? |
|-------------|---------|-------|-----------|
| `SFS_PAT` | GitHub Actions automation | All repos | ✅ Yes |
| `REPLIT_TOKEN` | Replit deployment | Repos with Replit | ❌ Optional |
| `SFS_SYNC_URL` | Webhook sync | Repos with sync | ❌ Optional |
| `DATABASE_URL` | Neon PostgreSQL | Repos with DB | ⚠️ Per-repo |
| `JWT_SECRET` | Authentication | Repos with auth | ⚠️ Per-repo |
| `STRIPE_SECRET_KEY` | Payments | Repos with Stripe | ⚠️ Per-repo |

#### 5.2 Store Secrets Safely

**Options:**
1. **Password Manager** (Recommended)
   - 1Password, Bitwarden, LastPass
   - Create "SFS GitHub Secrets" vault

2. **Encrypted File**
   ```bash
   # Create encrypted secrets file
   gpg -c sfs-secrets.txt
   # Stores as sfs-secrets.txt.gpg

   # Decrypt when needed
   gpg sfs-secrets.txt.gpg
   ```

3. **Environment Variables** (Local dev only)
   ```bash
   # Add to ~/.bashrc or ~/.zshrc
   export SFS_PAT="github_pat_..."
   export REPLIT_TOKEN="..."
   ```

---

## Quick Recovery Commands

### Generate New PAT
```
https://github.com/settings/tokens/new
Scopes: repo, workflow, read:org
```

### Apply to One Repo
```bash
gh secret set SFS_PAT --repo smartflow-systems/REPO_NAME
```

### Apply to All Repos (Bulk)
```bash
bash sfs-bulk-secrets-apply.sh
```

### Verify Secrets
```bash
gh secret list --repo smartflow-systems/REPO_NAME
```

### Test CI/CD
```bash
gh workflow run WORKFLOW_NAME --repo smartflow-systems/REPO_NAME
```

---

## Prevention (Future)

1. **Never delete secrets without replacement ready**
2. **Keep backup of PAT in password manager**
3. **Set PAT expiration to 90 days with calendar reminder**
4. **Use organization-level secrets where possible**
5. **Document all secrets in SFS secrets inventory**

---

## Emergency Contacts

**GitHub Account:** boweazy
**Organization:** smartflow-systems
**CLI Status:** ✅ Authenticated

**Need help?**
- GitHub Support: https://support.github.com
- Replit Support: https://replit.com/support

---

## Estimated Time

| Phase | Duration |
|-------|----------|
| Generate secrets | 5 min |
| Identify repos | 10 min |
| Apply secrets (bulk) | 30 min |
| Verification | 10 min |
| Documentation | 5 min |
| **Total** | **~60 min** |

---

**Next Step:** Generate new GitHub PAT and run bulk secrets script.
