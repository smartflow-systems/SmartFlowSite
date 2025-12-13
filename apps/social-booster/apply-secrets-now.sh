#!/usr/bin/env bash
repos=(
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
for repo in "${repos[@]}"; do
  if cat .temp_token.txt | gh secret set SFS_PAT --repo "$repo" 2>&1; then
    echo "✅ $repo"
    ((success++))
  else
    echo "❌ $repo"
  fi
done
echo ""
echo "Fixed: $success/17 repos"
rm -f .temp_token.txt
