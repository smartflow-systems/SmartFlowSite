#!/usr/bin/env bash
set -euo pipefail

echo "=============================================="
echo "Fixing 19 Repos Missing SFS_PAT"
echo "=============================================="
echo ""

# Get the current gh CLI token
CURRENT_TOKEN=$(gh auth token 2>/dev/null || echo "")

if [ -z "$CURRENT_TOKEN" ]; then
  echo "❌ ERROR: No GitHub token found"
  echo "Run: gh auth login"
  exit 1
fi

echo "✅ Using authenticated GitHub CLI token"
echo ""
echo "⚠️  This will set SFS_PAT on 19 repositories"
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ Cancelled"
  exit 0
fi

echo ""

# List of repos missing SFS_PAT
repos=(
  "smartflow-systems/sfs-control-tower"
  "smartflow-systems/SmartFlowSite-v2"
  "smartflow-systems/sfs-genesis-template"
  "smartflow-systems/WebsiteBuilder"
  "smartflow-systems/AICompanionBot"
  "smartflow-systems/sfs-control-center"
  "smartflow-systems/smartflow-theme-package"
  "smartflow-systems/sfs-mobile-app"
  "smartflow-systems/sfs-design-system"
  "smartflow-systems/sfs-deploy-hub"
  "smartflow-systems/sfs-claude-skills"
  "smartflow-systems/demo-repository"
  "smartflow-systems/SmartFloiwSystems"
  "smartflow-systems/SFSPersonalVPN"
  "smartflow-systems/codegpt"
  "smartflow-systems/SFS-SocialPowerhouseB"
  "smartflow-systems/SFS-SocialPowerhouseS"
  "smartflow-systems/sfs-theme-package"
  "smartflow-systems/sfs-status-page"
)

success=0
failed=0

for repo in "${repos[@]}"; do
  echo "Processing: $repo"
  
  if echo "$CURRENT_TOKEN" | gh secret set SFS_PAT --repo "$repo" 2>/dev/null; then
    echo "  ✅ Set SFS_PAT"
    ((success++))
  else
    echo "  ❌ Failed to set SFS_PAT"
    ((failed++))
  fi
  echo ""
done

echo "=============================================="
echo "✅ COMPLETE!"
echo "=============================================="
echo "Success: $success repos"
echo "Failed: $failed repos"
echo ""
