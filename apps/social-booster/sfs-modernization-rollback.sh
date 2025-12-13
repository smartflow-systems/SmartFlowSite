#!/usr/bin/env bash
set -euo pipefail

echo "=============================================="
echo "SocialScaleBooster Modernization ROLLBACK"
echo "SmartFlow Systems"
echo "=============================================="
echo ""

# Repo guard
if [ ! -d ".git" ]; then
  echo "❌ ERROR: Must run from repository root"
  exit 1
fi

# Find most recent backup
if [ ! -d ".sfs-backups" ]; then
  echo "❌ ERROR: No backups found in .sfs-backups/"
  exit 1
fi

latest_backup=$(ls -1dt .sfs-backups/*/ 2>/dev/null | head -n 1)

if [ -z "$latest_backup" ]; then
  echo "❌ ERROR: No backup directories found"
  exit 1
fi

echo "📦 Found backup: $latest_backup"
echo ""
echo "⚠️  WARNING: This will restore files from backup and undo modernization."
echo "Files to restore:"
ls -1 "$latest_backup"
echo ""
read -p "Continue with rollback? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "❌ Rollback cancelled"
  exit 0
fi

echo ""
echo "🔄 Restoring files from backup..."

# Restore backed up files
if [ -f "$latest_backup/server.js" ]; then
  cp "$latest_backup/server.js" server.js
  echo "  ✅ Restored server.js"
fi

if [ -f "$latest_backup/index.css" ]; then
  cp "$latest_backup/index.css" client/src/index.css
  echo "  ✅ Restored client/src/index.css"
fi

if [ -f "$latest_backup/package.json" ]; then
  cp "$latest_backup/package.json" package.json
  echo "  ✅ Restored package.json"
fi

if [ -f "$latest_backup/README.md" ]; then
  cp "$latest_backup/README.md" README.md
  echo "  ✅ Restored README.md"
fi

if [ -f "$latest_backup/routes.ts" ]; then
  cp "$latest_backup/routes.ts" server/routes.ts
  echo "  ✅ Restored server/routes.ts"
fi

echo ""
echo "🗑️  Removing modernization files..."

# Remove new files added during modernization
rm -f server/middleware/auth.ts
rm -f server/auth/index.ts
rm -f .env.example
rm -f .github/workflows/sfs-deploy.yml
rm -f sfs-modernization-apply.sh
rm -f sfs-modernization-rollback.sh

echo "  ✅ Removed modernization files"

echo ""
echo "📦 Reinstalling original dependencies..."
npm install

echo ""
echo "✅ ROLLBACK COMPLETE"
echo ""
echo "Backup preserved in: $latest_backup"
echo ""
echo "To commit rollback:"
echo "  git add -A"
echo "  git commit -m 'chore: rollback modernization'"
echo "  git push origin main"
echo ""
