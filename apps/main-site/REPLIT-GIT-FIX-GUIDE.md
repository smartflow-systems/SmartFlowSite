# Replit Git Issue - Fix Guide

## Problem Summary

Your Replit workspace has these issues:
1. **Branch divergence** - 6 local commits vs 4 remote commits
2. **Permission denied** - User `boweazy` can't push to `smartflow-systems/SmartFlowSite`
3. **Merge conflict** - In `.github/workflows/ci.yml`

## Quick Fix (Recommended)

Run this in the Replit Shell to reset your workspace to match GitHub:

```bash
bash auto-fix-replit.sh
```

This will:
- Remove git lock files
- Abort pending merges
- Stash your local changes (so they're not lost)
- Reset to match the remote repository
- Clean up untracked files

---

## Manual Fix Steps

If you prefer to fix manually:

### 1. Clean Up Git State

```bash
# Remove lock files
rm .git/index.lock

# Abort the merge
git merge --abort

# Check status
git status
```

### 2. Save Local Changes (Optional)

```bash
# If you have important local changes
git stash save "Backup before reset"
```

### 3. Reset to Remote

```bash
# Fetch latest
git fetch origin

# Reset to match remote
git reset --hard origin/main

# Clean untracked files
git clean -fd
```

---

## Fix Authentication Issue

The permission error happens because `boweazy` doesn't have write access to the repository.

### Option 1: Use SSH (Recommended)

```bash
# Change remote URL to SSH
git remote set-url origin git@github.com:smartflow-systems/SmartFlowSite.git

# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy the public key
cat ~/.ssh/id_ed25519.pub

# Add this key to GitHub at:
# https://github.com/settings/keys
```

### Option 2: Use Personal Access Token

```bash
# Generate a token at: https://github.com/settings/tokens
# Give it 'repo' permissions

# Update remote URL with token
git remote set-url origin https://YOUR_TOKEN@github.com/smartflow-systems/SmartFlowSite.git
```

### Option 3: Ask for Repository Access

Contact the repository owner to add `boweazy` as a collaborator:
https://github.com/smartflow-systems/SmartFlowSite/settings/access

---

## Understanding the Divergence

Your Replit has **6 local commits** that aren't on GitHub.
GitHub has **4 commits** that aren't on Replit.

To see what's different:

```bash
# See local commits not on remote
git log origin/main..HEAD

# See remote commits not local
git log HEAD..origin/main
```

---

## After Fixing Authentication

Once authentication is set up, you can push changes:

```bash
# Make your changes
git add .
git commit -m "Your commit message"

# Push to GitHub
git push origin main
```

---

## Prevention Tips

1. **Always pull before pushing:**
   ```bash
   git pull origin main
   ```

2. **Set up authentication early:**
   - Use SSH keys for Replit projects
   - Store personal access tokens securely

3. **Check status often:**
   ```bash
   git status
   git fetch origin
   ```

4. **Keep Replit in sync:**
   - Pull changes from GitHub regularly
   - Push your changes frequently

---

## What the Scripts Do

### `fix-replit-git.sh`
- Diagnostic tool
- Shows current state
- Provides recommendations
- Doesn't make changes automatically

### `auto-fix-replit.sh`
- Automatic fix
- Resets to match GitHub
- Stashes local changes first
- Use when you want a clean slate

---

## Current Repository State

**Local (on your machine):**
- Latest commit: `b47b7c3 chore: update SFS infrastructure and theming`
- Clean, up to date with GitHub ✅

**Replit:**
- Has diverged from GitHub
- Has merge conflicts
- Authentication issues

**GitHub Remote:**
- Latest commit: `b47b7c3 chore: update SFS infrastructure and theming`
- This is the source of truth ✅

---

## Recommended Action

1. **Run the auto-fix script in Replit:**
   ```bash
   cd ~/workspace
   bash auto-fix-replit.sh
   ```

2. **Set up SSH authentication:**
   ```bash
   git remote set-url origin git@github.com:smartflow-systems/SmartFlowSite.git
   ```

3. **Add SSH key to GitHub**
   - Generate: `ssh-keygen -t ed25519 -C "your_email@example.com"`
   - Copy: `cat ~/.ssh/id_ed25519.pub`
   - Add at: https://github.com/settings/keys

4. **Verify it works:**
   ```bash
   git fetch origin
   git status
   ```

---

## Need Help?

If you encounter issues:

1. Check the current state:
   ```bash
   bash fix-replit-git.sh
   ```

2. Review the output and follow the recommendations

3. If stuck, share the output with your team

---

**Last Updated:** 2025-11-21
**Status:** Ready to fix
**Scripts Available:**
- `fix-replit-git.sh` (diagnostic)
- `auto-fix-replit.sh` (automatic fix)
