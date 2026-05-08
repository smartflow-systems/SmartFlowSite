#!/usr/bin/env bash
set -euo pipefail

echo "=============================================="
echo "SFS Bulk Secrets Recovery Tool"
echo "SmartFlow Systems - GitHub Secrets Manager"
echo "=============================================="
echo ""

# Check gh CLI is installed and authenticated
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) not installed"
  echo "Install: https://cli.github.com"
  exit 1
fi

if ! gh auth status &> /dev/null; then
  echo "❌ Not authenticated with GitHub CLI"
  echo "Run: gh auth login"
  exit 1
fi

echo "✅ GitHub CLI authenticated"
echo ""

# Prompt for secrets
echo "📝 Enter secrets (required secrets marked with *):"
echo ""
read -sp "* SFS_PAT (GitHub Personal Access Token): " SFS_PAT
echo ""

if [ -z "$SFS_PAT" ]; then
  echo "❌ ERROR: SFS_PAT is required"
  exit 1
fi

read -sp "  REPLIT_TOKEN (optional, press Enter to skip): " REPLIT_TOKEN
echo ""

read -p "  SFS_SYNC_URL (optional, press Enter to skip): " SFS_SYNC_URL
echo ""

# Confirm before proceeding
echo ""
echo "⚠️  WARNING: This will set secrets on ALL repositories in:"
echo "  - smartflow-systems organization"
echo "  - boweazy user account"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ Cancelled"
  exit 0
fi

echo ""
echo "📋 Fetching repository list..."

# Get all repos from both sources
REPOS_ORG=$(gh repo list smartflow-systems --limit 100 --json nameWithOwner -q '.[].nameWithOwner' 2>/dev/null || echo "")
REPOS_USER=$(gh repo list boweazy --limit 100 --json nameWithOwner -q '.[].nameWithOwner' 2>/dev/null || echo "")

# Combine and deduplicate
REPOS=$(echo -e "$REPOS_ORG\n$REPOS_USER" | sort -u | grep -v '^$')

TOTAL_REPOS=$(echo "$REPOS" | wc -l)
echo "✅ Found $TOTAL_REPOS repositories"
echo ""

# Counters
success_count=0
error_count=0
skipped_count=0

# Process each repo
repo_num=0
for repo in $REPOS; do
  ((repo_num++))
  echo "[$repo_num/$TOTAL_REPOS] Processing: $repo"

  # Check if repo has GitHub Actions
  has_workflows=$(gh api "repos/$repo/actions/workflows" --jq '.total_count' 2>/dev/null || echo "0")

  if [ "$has_workflows" -eq 0 ]; then
    echo "  ⏭️  No workflows, skipping"
    ((skipped_count++))
    echo ""
    continue
  fi

  # Apply SFS_PAT
  if echo "$SFS_PAT" | gh secret set SFS_PAT --repo "$repo" 2>/dev/null; then
    echo "  ✅ Set SFS_PAT"
    ((success_count++))
  else
    echo "  ❌ Failed to set SFS_PAT (permission denied?)"
    ((error_count++))
    echo ""
    continue
  fi

  # Apply REPLIT_TOKEN if provided
  if [ -n "$REPLIT_TOKEN" ]; then
    if echo "$REPLIT_TOKEN" | gh secret set REPLIT_TOKEN --repo "$repo" 2>/dev/null; then
      echo "  ✅ Set REPLIT_TOKEN"
    else
      echo "  ⚠️  Could not set REPLIT_TOKEN"
    fi
  fi

  # Apply SFS_SYNC_URL if provided
  if [ -n "$SFS_SYNC_URL" ]; then
    if echo "$SFS_SYNC_URL" | gh secret set SFS_SYNC_URL --repo "$repo" 2>/dev/null; then
      echo "  ✅ Set SFS_SYNC_URL"
    else
      echo "  ⚠️  Could not set SFS_SYNC_URL"
    fi
  fi

  echo ""
done

echo "=============================================="
echo "✅ BULK SECRETS APPLICATION COMPLETE!"
echo "=============================================="
echo ""
echo "📊 Summary:"
echo "  Total repositories: $TOTAL_REPOS"
echo "  Success: $success_count"
echo "  Errors: $error_count"
echo "  Skipped (no workflows): $skipped_count"
echo ""

if [ $error_count -gt 0 ]; then
  echo "⚠️  $error_count repositories had errors"
  echo "Check permissions and try again for failed repos"
  echo ""
fi

echo "✅ Next steps:"
echo "  1. Verify secrets: gh secret list --repo REPO_NAME"
echo "  2. Test workflow: gh workflow run WORKFLOW.yml --repo REPO_NAME"
echo "  3. Monitor runs: gh run list --repo REPO_NAME"
echo ""
