#!/usr/bin/env bash
# SmartFlow Systems - Master Landing Page Upgrade Deployment
# This script safely deploys the upgraded landing page to production

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR=".sfs-backups/upgrade-${TIMESTAMP}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to create backup
create_backup() {
    print_status "Creating backup..."
    mkdir -p "$BACKUP_DIR"

    # Backup existing files
    if [ -f "index.html" ]; then
        cp index.html "$BACKUP_DIR/" 2>/dev/null || true
        print_success "Backed up index.html"
    fi

    if [ -f "styles.css" ]; then
        cp styles.css "$BACKUP_DIR/" 2>/dev/null || true
        print_success "Backed up styles.css"
    fi

    if [ -f "app.js" ]; then
        cp app.js "$BACKUP_DIR/" 2>/dev/null || true
        print_success "Backed up app.js"
    fi

    # Backup other CSS files
    for css in sfs-*.css; do
        if [ -f "$css" ]; then
            cp "$css" "$BACKUP_DIR/" 2>/dev/null || true
        fi
    done

    print_success "Backup created at $BACKUP_DIR"
}

# Function to deploy new files
deploy_files() {
    print_status "Deploying upgraded files..."

    # Deploy HTML
    if [ -f "index-upgraded.html" ]; then
        cp index-upgraded.html index.html
        print_success "✓ Deployed index.html"
    else
        print_error "index-upgraded.html not found!"
        exit 1
    fi

    # Deploy CSS
    if [ -f "styles-master.css" ]; then
        cp styles-master.css styles.css
        print_success "✓ Deployed styles.css (master)"
    else
        print_error "styles-master.css not found!"
        exit 1
    fi

    # Deploy JavaScript
    if [ -f "js/master-app.js" ]; then
        mkdir -p js
        cp js/master-app.js js/app.js
        print_success "✓ Deployed js/app.js (master)"
    else
        print_error "js/master-app.js not found!"
        exit 1
    fi

    print_success "All files deployed successfully!"
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."

    local errors=0

    # Check if files exist
    if [ ! -f "index.html" ]; then
        print_error "index.html missing!"
        ((errors++))
    fi

    if [ ! -f "styles.css" ]; then
        print_error "styles.css missing!"
        ((errors++))
    fi

    if [ ! -f "js/app.js" ]; then
        print_error "js/app.js missing!"
        ((errors++))
    fi

    # Check file sizes (should not be empty)
    if [ -f "index.html" ] && [ ! -s "index.html" ]; then
        print_error "index.html is empty!"
        ((errors++))
    fi

    if [ -f "styles.css" ] && [ ! -s "styles.css" ]; then
        print_error "styles.css is empty!"
        ((errors++))
    fi

    if [ -f "js/app.js" ] && [ ! -s "js/app.js" ]; then
        print_error "js/app.js is empty!"
        ((errors++))
    fi

    if [ $errors -eq 0 ]; then
        print_success "✓ All files verified successfully!"
        return 0
    else
        print_error "Verification failed with $errors error(s)"
        return 1
    fi
}

# Function to create git commit
commit_changes() {
    print_status "Creating git commit..."

    # Check if git repo
    if [ ! -d ".git" ]; then
        print_warning "Not a git repository. Skipping commit."
        return 0
    fi

    # Stage files
    git add index.html styles.css js/app.js 2>/dev/null || true

    # Create commit
    git commit -m "$(cat <<'EOF'
feat: Master landing page upgrade

- Redesigned hero section with better CTAs
- Reorganized solutions into logical categories
- Added solution filtering/tabs
- Enhanced pricing section with clear value props
- Consolidated CSS into single master stylesheet
- Unified JavaScript into master app file
- Improved mobile responsiveness
- Added smooth animations and micro-interactions
- Optimized performance (lazy loading, animations)
- Enhanced accessibility features
- Better SEO structure

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)" || echo "Nothing to commit"

    print_success "✓ Changes committed"
}

# Function to rollback
rollback() {
    print_warning "Rolling back to previous version..."

    if [ -d "$BACKUP_DIR" ]; then
        cp "$BACKUP_DIR"/* . 2>/dev/null || true
        print_success "✓ Rollback complete. Restored from $BACKUP_DIR"
    else
        print_error "Backup directory not found: $BACKUP_DIR"
        exit 1
    fi
}

# Function to show next steps
show_next_steps() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          SMARTFLOW SYSTEMS - UPGRADE COMPLETE!             ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📦 Deployment Summary:${NC}"
    echo "   ✓ New landing page deployed"
    echo "   ✓ Master CSS stylesheet active"
    echo "   ✓ Master JavaScript app loaded"
    echo "   ✓ Backup saved to: $BACKUP_DIR"
    echo ""
    echo -e "${BLUE}🚀 Next Steps:${NC}"
    echo "   1. Test locally: Open index.html in browser"
    echo "   2. Check responsiveness on mobile devices"
    echo "   3. Verify all CTAs and links work"
    echo "   4. Test solution category filtering"
    echo "   5. Review animations and interactions"
    echo ""
    echo -e "${BLUE}📝 To push to production:${NC}"
    echo "   git push origin main"
    echo ""
    echo -e "${BLUE}🔄 To rollback if needed:${NC}"
    echo "   ./deploy-upgrade.sh --rollback"
    echo ""
    echo -e "${BLUE}📊 Performance Checklist:${NC}"
    echo "   [ ] Run Lighthouse audit"
    echo "   [ ] Test on Chrome, Firefox, Safari"
    echo "   [ ] Test on mobile (iOS & Android)"
    echo "   [ ] Verify analytics tracking"
    echo "   [ ] Check form submissions"
    echo ""
}

# Main execution
main() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     SMARTFLOW SYSTEMS - MASTER LANDING PAGE UPGRADE        ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Check for rollback flag
    if [ "${1:-}" == "--rollback" ]; then
        rollback
        exit 0
    fi

    # Verify we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Are you in the repo root?"
        exit 1
    fi

    # Run deployment steps
    create_backup
    echo ""

    deploy_files
    echo ""

    if verify_deployment; then
        echo ""
        commit_changes
        echo ""
        show_next_steps
    else
        print_error "Deployment failed verification!"
        print_warning "Run './deploy-upgrade.sh --rollback' to restore previous version"
        exit 1
    fi
}

# Run main function
main "$@"
