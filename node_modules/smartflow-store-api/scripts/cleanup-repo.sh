#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# SmartFlow Systems Repository Cleanup Script
# ==============================================================================
# Cleans up backup files and temporary artifacts while preserving all fixes
# Usage: ./cleanup-repo.sh [--dry-run]
# ==============================================================================

# Parse arguments
DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "🔍 DRY RUN MODE - No changes will be made"
  echo "=================================================="
fi

# Helper function for dry-run aware commands
run_cmd() {
  if [ "$DRY_RUN" = true ]; then
    echo "[DRY RUN] Would execute: $*"
  else
    "$@"
  fi
}

# Helper function for file deletion
delete_files() {
  local pattern="$1"
  local description="$2"

  if [ "$DRY_RUN" = true ]; then
    local count=$(find . -name "$pattern" 2>/dev/null | wc -l)
    if [ "$count" -gt 0 ]; then
      echo ""
      echo "Would delete $count file(s) matching: $pattern"
      echo "Description: $description"
      find . -name "$pattern" -type f 2>/dev/null | head -10
      [ "$count" -gt 10 ] && echo "... and $((count - 10)) more"
    fi
  else
    local deleted=$(find . -name "$pattern" -type f -delete -print 2>/dev/null | wc -l)
    [ "$deleted" -gt 0 ] && echo "✓ Deleted $deleted $description file(s)"
  fi
}

# Enter repo
for d in "$HOME/workspace/SmartFlowSite" "$HOME/SmartFlowSite" "$PWD"; do
  [ -d "$d/.git" ] && { cd "$d"; break; }
done

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ Not inside a git repository"
  exit 1
fi

echo "📂 Repository: $(basename "$PWD")"
echo "📍 Location: $PWD"
echo ""

# Check for SFS_PAT (only needed for non-dry-run backup)
if [ "$DRY_RUN" = false ]; then
  : "${SFS_PAT:?Missing SFS_PAT in Replit → Tools → Secrets}"
fi

# ==============================================================================
# STEP 1: Create Backup Branch
# ==============================================================================
echo "📦 STEP 1: Backup current state"
echo "=================================================="

if [ "$DRY_RUN" = true ]; then
  echo "[DRY RUN] Would create backup branch: backup/wip-TIMESTAMP"
  echo "[DRY RUN] Would push to remote"
else
  WIPBR="backup/wip-$(date +%Y%m%d-%H%M%S)"
  git add -A || true

  if ! git diff --cached --quiet || [ -n "$(git ls-files --others --exclude-standard)" ]; then
    echo "Creating backup commit..."
    git commit -m "backup(wip): snapshot before cleanup"
  else
    echo "No changes to backup"
  fi

  url="$(git remote get-url origin)"
  OWNER_REPO="$(echo "$url" | sed -E 's#.*github.com[:/]{1}([^/]+/[^/.]+)(\.git)?#\1#')"
  PTURL="https://${SFS_PAT}@github.com/${OWNER_REPO}.git"

  git branch -f "$WIPBR" HEAD
  git push -u "$PTURL" "$WIPBR:$WIPBR" 2>/dev/null && echo "✓ Backup pushed: $WIPBR" || echo "⚠ Backup branch exists"
fi

echo ""

# ==============================================================================
# STEP 2: Cleanup Temporary & Backup Files
# ==============================================================================
echo "🧹 STEP 2: Remove temporary files"
echo "=================================================="

# Workflow backup files
delete_files "*.bak" "workflow backup"
delete_files "*.bak.*" "timestamped backup"
delete_files "*.orig" "merge conflict original"

# Package backup files
delete_files "package.json.bak*" "package.json backup"
delete_files "package-lock.json.bak*" "package-lock backup"

# Git module files
if [ -f ".gitmodules" ]; then
  if [ "$DRY_RUN" = true ]; then
    echo ""
    echo "Would delete: .gitmodules"
  else
    rm .gitmodules
    echo "✓ Removed .gitmodules"
  fi
fi

# SFS backup directories
if [ -d ".sfs-backups" ]; then
  if [ "$DRY_RUN" = true ]; then
    echo ""
    echo "Would remove directory: .sfs-backups/"
  else
    rm -rf .sfs-backups
    echo "✓ Removed .sfs-backups/"
  fi
fi

# Other temporary files
delete_files ".DS_Store" "macOS metadata"
delete_files "Thumbs.db" "Windows thumbnail cache"
delete_files "*.swp" "Vim swap file"
delete_files "*.swo" "Vim swap file"
delete_files "*~" "editor backup"

echo ""

# ==============================================================================
# STEP 3: Ensure Design System Files Present
# ==============================================================================
echo "🎨 STEP 3: Verify design system files"
echo "=================================================="

check_design_file() {
  local filename="$1"
  if [ -f "$filename" ]; then
    echo "✓ $filename exists"
  else
    echo "⚠ $filename missing"
    if [ "$DRY_RUN" = true ] && [ "$DRY_RUN" != true ]; then
      # Only restore from backup if not in dry-run and file exists in backup
      if git cat-file -e "${WIPBR:-HEAD}:$filename" 2>/dev/null; then
        echo "  Would restore from backup"
      fi
    fi
  fi
}

check_design_file "SFS-DESIGN-SYSTEM.md"
check_design_file "sfs-globals.css"
check_design_file "sfs-theme-config.json"

echo ""

# ==============================================================================
# STEP 4: Show Summary
# ==============================================================================
echo "📊 STEP 4: Summary"
echo "=================================================="

if [ "$DRY_RUN" = true ]; then
  echo "This was a DRY RUN - no changes were made"
  echo ""
  echo "To apply these changes, run:"
  echo "  $0"
else
  # Commit cleanup if there are changes
  git add -A
  if git diff --cached --quiet; then
    echo "No changes to commit"
  else
    git commit -m "chore: cleanup backup files and temporary artifacts" \
                -m "Remove .bak files, keep all security and workflow fixes."
    echo "✓ Changes committed"

    # Push to main
    git push "$PTURL" main:main
    echo "✓ Pushed to main"

    echo ""
    echo "✅ Cleanup complete!"
    echo "Commits  → https://github.com/${OWNER_REPO}/commits/main"
    echo "Actions  → https://github.com/${OWNER_REPO}/actions"
    echo "Backup   → ${WIPBR}"
  fi
fi

echo ""
echo "Done! 🎉"
