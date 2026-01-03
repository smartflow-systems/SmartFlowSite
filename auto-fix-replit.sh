#!/bin/bash
# Automatic fix for Replit Git issues
# This will reset Replit to match the remote repository

set -uo pipefail

echo "========================================"
echo "  AUTO-FIX REPLIT GIT ISSUES"
echo "========================================"
echo ""
echo "⚠ This will reset the Replit workspace to match GitHub"
echo ""

# Clean up locks
echo "Cleaning git locks..."
rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/main.lock 2>/dev/null

# Abort any merges
echo "Aborting pending merges..."
git merge --abort 2>/dev/null || true

# Stash any local changes (just in case we want them later)
echo "Stashing local changes..."
git stash save "Replit auto-backup before reset $(date)" 2>/dev/null || true

# Fetch latest
echo "Fetching from remote..."
git fetch origin

# Reset to remote
echo "Resetting to match remote..."
git reset --hard origin/main

# Clean untracked files (except attached_assets)
echo "Cleaning untracked files..."
git clean -fd -e attached_assets/

echo ""
echo "✓ Replit workspace reset to match GitHub!"
echo ""
echo "Current status:"
git status
echo ""
echo "If you had important local changes, they're in the stash:"
echo "  git stash list"
echo "  git stash pop  # to restore them"
echo ""
echo "========================================"
