#!/bin/bash
set -euo pipefail

echo "🔍 AUDITING ALL 49 SFS REPOSITORIES"
echo ""
echo "Checking which repos need these secrets:"
echo "  - Stripe (payment processing)"
echo "  - OpenAI (AI features)"
echo "  - Database (data storage)"
echo "  - SendGrid (email notifications)"
echo ""

cd ~/workspace

# Find all package.json files to identify Node.js projects
echo "=== NODE.JS PROJECTS (need secrets) ==="
find . -maxdepth 2 -name "package.json" -exec dirname {} \; | while read dir; do
  echo "📦 $dir"
  
  # Check if it uses Stripe
  if grep -q "stripe" "$dir/package.json" 2>/dev/null; then
    echo "   → Needs: STRIPE_SECRET_KEY"
  fi
  
  # Check if it uses OpenAI
  if grep -q "openai" "$dir/package.json" 2>/dev/null; then
    echo "   → Needs: OPENAI_API_KEY"
  fi
  
  # Check if it has Prisma (database)
  if grep -q "prisma" "$dir/package.json" 2>/dev/null; then
    echo "   → Needs: DATABASE_URL"
  fi
  
  # Check if it uses SendGrid
  if grep -q "sendgrid\|nodemailer" "$dir/package.json" 2>/dev/null; then
    echo "   → Needs: SENDGRID_API_KEY"
  fi
  
  echo ""
done

echo ""
echo "=== PYTHON PROJECTS (need secrets) ==="
find . -maxdepth 2 -name "requirements.txt" -exec dirname {} \; | while read dir; do
  echo "🐍 $dir"
  
  # Check dependencies
  if grep -q "stripe" "$dir/requirements.txt" 2>/dev/null; then
    echo "   → Needs: STRIPE_SECRET_KEY"
  fi
  
  if grep -q "openai" "$dir/requirements.txt" 2>/dev/null; then
    echo "   → Needs: OPENAI_API_KEY"
  fi
  
  echo ""
done

