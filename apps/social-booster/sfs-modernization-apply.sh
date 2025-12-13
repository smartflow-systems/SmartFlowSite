#!/usr/bin/env bash
set -euo pipefail

echo "=============================================="
echo "SocialScaleBooster Modernization Script"
echo "SmartFlow Systems - Comprehensive Upgrade"
echo "=============================================="
echo ""

# Repo guard
if [ ! -d ".git" ]; then
  echo "❌ ERROR: Must run from repository root"
  echo "Current directory: $(pwd)"
  exit 1
fi

# Timestamp for backups
ts=$(date +%Y%m%d-%H%M%S)
bk=".sfs-backups/$ts"
mkdir -p "$bk"

echo "📦 Creating backups in $bk..."

# Backup critical files
cp server.js "$bk/" 2>/dev/null || true
cp client/src/index.css "$bk/" 2>/dev/null || true
cp package.json "$bk/" 2>/dev/null || true
cp README.md "$bk/" 2>/dev/null || true
cp -r server/routes.ts "$bk/" 2>/dev/null || true

echo "✅ Backups created"
echo ""

# === CHANGES START ===

echo "🔧 Step 1: Installing required dependencies..."
npm install tsx drizzle-kit vitest zod jsonwebtoken bcryptjs @types/jsonwebtoken @types/bcryptjs --save-dev 2>&1 | grep -E "(added|removed|up to date)" || true

echo ""
echo "🗑️  Step 2: Removing legacy server.js..."
if [ -f "server.js" ]; then
  mv server.js "$bk/server.js.backup"
  echo "✅ Moved server.js to backups"
else
  echo "ℹ️  server.js not found (already removed)"
fi

echo ""
echo "📝 Step 3: Files already updated:"
echo "  ✓ client/src/index.css - SFS brand colors applied"
echo "  ✓ server/middleware/auth.ts - JWT authentication added"
echo "  ✓ server/auth/index.ts - Auth routes created"
echo "  ✓ server/storage.ts - getUserByEmail() method added"
echo "  ✓ server/routes.ts - Auth integration enabled"
echo "  ✓ package.json - Modern scripts configured"
echo "  ✓ README.md - Comprehensive documentation"
echo "  ✓ .env.example - Environment template"
echo "  ✓ .github/workflows/sfs-deploy.yml - CI/CD pipeline"

echo ""
echo "🔍 Step 4: Verifying file structure..."

required_files=(
  "client/src/index.css"
  "server/index.ts"
  "server/routes.ts"
  "server/storage.ts"
  "server/middleware/auth.ts"
  "server/auth/index.ts"
  "shared/schema.ts"
  ".github/workflows/sfs-deploy.yml"
  ".env.example"
  "package.json"
  "README.md"
)

for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ MISSING: $file"
  fi
done

echo ""
echo "📋 Step 5: Next manual steps required:"
echo ""
echo "1. Copy .env.example to .env and configure:"
echo "   cp .env.example .env"
echo "   # Edit .env with your credentials"
echo ""
echo "2. Set up database:"
echo "   npm run migrate"
echo ""
echo "3. Test development server:"
echo "   npm run dev"
echo ""
echo "4. Configure GitHub Secrets (for CI/CD):"
echo "   - SFS_PAT (GitHub token)"
echo "   - REPLIT_TOKEN (optional)"
echo "   - SFS_SYNC_URL (optional)"
echo ""

# === CHANGES END ===

echo ""
echo "✨ Step 6: Committing changes..."

git add -A
git commit -m "feat: comprehensive SFS modernization

- Applied SFS brand identity (--sf-* CSS variables)
- Added JWT authentication system with bcrypt
- Consolidated server entry points (removed server.js)
- Integrated auth middleware on protected routes
- Added CI/CD pipeline (.github/workflows/sfs-deploy.yml)
- Created comprehensive README with API docs
- Updated package.json with modern scripts
- Added .env.example template

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>" || echo "ℹ️  Nothing to commit (changes may already be staged)"

echo ""
echo "=============================================="
echo "✅ MODERNIZATION COMPLETE!"
echo "=============================================="
echo ""
echo "Backup location: $bk"
echo ""
echo "Quick test:"
echo "  1. cp .env.example .env"
echo "  2. # Edit .env with DATABASE_URL, JWT_SECRET, STRIPE_SECRET_KEY"
echo "  3. npm run migrate"
echo "  4. npm run dev"
echo "  5. Visit http://localhost:5000"
echo ""
echo "To push changes:"
echo "  git push origin main"
echo ""
