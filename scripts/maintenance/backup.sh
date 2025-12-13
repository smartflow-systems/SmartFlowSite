#!/usr/bin/env bash
set -euo pipefail

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    SMARTFLOW BACKUP UTILITY                   ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
BACKUP_DIR=".sfs-backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="backup-${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Create backup directory
mkdir -p "$BACKUP_PATH"

echo "📦 Creating backup: $BACKUP_NAME"
echo "📁 Backup location: $BACKUP_PATH"
echo ""

# Backup critical files
echo "🔄 Backing up critical files..."

# Root configuration files
echo -n "  • Root configs... "
cp package.json "$BACKUP_PATH/" 2>/dev/null && echo "✓" || echo "✗"

# App configurations and source
echo -n "  • Applications... "
if [[ -d "apps" ]]; then
    cp -r apps "$BACKUP_PATH/" 2>/dev/null && echo "✓" || echo "✗"
else
    echo "⚠ (apps directory not found)"
fi

# Documentation
echo -n "  • Documentation... "
if [[ -d "docs" ]]; then
    cp -r docs "$BACKUP_PATH/" 2>/dev/null && echo "✓" || echo "✗"
else
    # Backup legacy docs
    for file in *.md; do
        [[ -f "$file" ]] && cp "$file" "$BACKUP_PATH/" 2>/dev/null
    done
    echo "✓ (legacy docs)"
fi

# Scripts
echo -n "  • Scripts... "
if [[ -d "scripts" ]]; then
    cp -r scripts "$BACKUP_PATH/" 2>/dev/null && echo "✓" || echo "✗"
else
    echo "⚠ (scripts directory not found)"
fi

# Infrastructure configs
echo -n "  • Infrastructure... "
if [[ -d "infrastructure" ]]; then
    cp -r infrastructure "$BACKUP_PATH/" 2>/dev/null && echo "✓" || echo "✗"
else
    echo "⚠ (infrastructure directory not found)"
fi

# GitHub workflows (if present)
echo -n "  • CI/CD configs... "
if [[ -d ".github" ]]; then
    cp -r .github "$BACKUP_PATH/" 2>/dev/null && echo "✓" || echo "✗"
else
    echo "⚠ (.github directory not found)"
fi

# Environment examples
echo -n "  • Environment configs... "
find . -name ".env.example" -exec cp {} "$BACKUP_PATH/" \; 2>/dev/null
find . -name ".env.local.example" -exec cp {} "$BACKUP_PATH/" \; 2>/dev/null
echo "✓"

echo ""
echo "📊 Backup summary:"

# Calculate backup size
if command -v du &> /dev/null; then
    BACKUP_SIZE=$(du -sh "$BACKUP_PATH" 2>/dev/null | cut -f1 || echo "Unknown")
    echo "  Size: $BACKUP_SIZE"
fi

# Count files
FILE_COUNT=$(find "$BACKUP_PATH" -type f 2>/dev/null | wc -l || echo "Unknown")
echo "  Files: $FILE_COUNT"

echo "  Location: $BACKUP_PATH"
echo ""

# Cleanup old backups (keep last 10)
echo "🧹 Cleaning up old backups (keeping last 10)..."
if [[ -d "$BACKUP_DIR" ]]; then
    find "$BACKUP_DIR" -maxdepth 1 -type d -name "backup-*" | sort -r | tail -n +11 | xargs rm -rf 2>/dev/null || true
    REMAINING=$(find "$BACKUP_DIR" -maxdepth 1 -type d -name "backup-*" 2>/dev/null | wc -l || echo "0")
    echo "✓ $REMAINING backups remaining"
fi

echo ""
echo "✅ Backup completed successfully!"
echo "📍 Restore with: cp -r $BACKUP_PATH/* ."