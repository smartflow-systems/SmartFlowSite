#!/usr/bin/env bash
echo "Checking which repos are missing SFS_PAT..."
echo ""

missing=0
has_secrets=0
no_access=0

for repo in $(gh repo list smartflow-systems --limit 100 --json nameWithOwner -q '.[].nameWithOwner'); do
  secrets=$(gh secret list --repo "$repo" 2>&1)
  
  if echo "$secrets" | grep -q "SFS_PAT"; then
    ((has_secrets++))
  elif echo "$secrets" | grep -qi "error\|cannot\|forbidden"; then
    echo "❌ No access: $repo"
    ((no_access++))
  else
    echo "⚠️  MISSING SFS_PAT: $repo"
    ((missing++))
  fi
done

echo ""
echo "======================================"
echo "Summary:"
echo "  ✅ Has SFS_PAT: $has_secrets repos"
echo "  ⚠️  Missing SFS_PAT: $missing repos"
echo "  ❌ No access: $no_access repos"
echo "======================================"
