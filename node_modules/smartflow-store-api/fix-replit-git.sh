#!/bin/bash
# Fix Replit Git Issues - Run this in Replit Shell

echo "========================================"
echo "  REPLIT GIT FIX SCRIPT"
echo "========================================"
echo ""

# Step 1: Clean up any git locks
echo "Step 1: Cleaning up git lock files..."
rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/main.lock 2>/dev/null
echo "✓ Lock files removed"
echo ""

# Step 2: Abort any pending merges
echo "Step 2: Aborting pending merges..."
git merge --abort 2>/dev/null || echo "No merge to abort"
echo ""

# Step 3: Check current status
echo "Step 3: Checking current status..."
git status
echo ""

# Step 4: Fetch latest from remote
echo "Step 4: Fetching latest from remote..."
git fetch origin
echo ""

# Step 5: Show divergence
echo "Step 5: Analyzing divergence..."
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
BASE=$(git merge-base @ @{u})

if [ "$LOCAL" = "$REMOTE" ]; then
    echo "✓ Already up to date!"
elif [ "$LOCAL" = "$BASE" ]; then
    echo "Need to pull (remote is ahead)"
    echo "Run: git pull origin main"
elif [ "$REMOTE" = "$BASE" ]; then
    echo "Need to push (local is ahead)"
    echo "But first, fix authentication..."
else
    echo "⚠ Branches have diverged!"
    echo "Local commits: $(git rev-list --count @..@{u})"
    echo "Remote commits: $(git rev-list --count @{u}..@)"
    echo ""
    echo "Recommended: Reset to remote and re-apply changes"
fi
echo ""

# Step 6: Fix authentication
echo "Step 6: Fixing authentication..."
echo ""
echo "The issue is that 'boweazy' doesn't have push access to 'smartflow-systems/SmartFlowSite'"
echo ""
echo "Option 1: Use SSH (Recommended)"
echo "----------------------------------------"
echo "git remote set-url origin git@github.com:smartflow-systems/SmartFlowSite.git"
echo ""
echo "Then ensure SSH key is added to GitHub:"
echo "1. Generate key: ssh-keygen -t ed25519 -C 'your_email@example.com'"
echo "2. Copy key: cat ~/.ssh/id_ed25519.pub"
echo "3. Add to GitHub: https://github.com/settings/keys"
echo ""
echo "Option 2: Use Personal Access Token"
echo "----------------------------------------"
echo "git remote set-url origin https://YOUR_TOKEN@github.com/smartflow-systems/SmartFlowSite.git"
echo ""
echo "Generate token at: https://github.com/settings/tokens"
echo ""
echo "Option 3: Reset to match remote (safest for now)"
echo "----------------------------------------"
echo "git reset --hard origin/main"
echo "git clean -fd"
echo ""

# Step 7: Show what to do next
echo "========================================"
echo "RECOMMENDED NEXT STEPS"
echo "========================================"
echo ""
echo "If you want to keep local changes:"
echo "  1. git stash"
echo "  2. git reset --hard origin/main"
echo "  3. git stash pop"
echo "  4. Fix authentication (use Option 1 or 2 above)"
echo "  5. git add ."
echo "  6. git commit -m 'your message'"
echo "  7. git push origin main"
echo ""
echo "If you want to discard local changes and match remote:"
echo "  1. git reset --hard origin/main"
echo "  2. git clean -fd"
echo ""
echo "Current remote URL:"
git remote get-url origin
echo ""
echo "========================================"
