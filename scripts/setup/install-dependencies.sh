#!/usr/bin/env bash
set -euo pipefail

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║              SMARTFLOW DEPENDENCY INSTALLER                   ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js version
check_node_version() {
    echo "🔍 Checking Node.js installation..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version | sed 's/v//')
        REQUIRED_VERSION="18.0.0"
        
        if [[ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" == "$REQUIRED_VERSION" ]]; then
            echo "✓ Node.js $NODE_VERSION (meets requirement: >= $REQUIRED_VERSION)"
            return 0
        else
            echo "✗ Node.js $NODE_VERSION is too old (requires >= $REQUIRED_VERSION)"
            return 1
        fi
    else
        echo "✗ Node.js not found"
        return 1
    fi
}

# Check npm version
check_npm_version() {
    echo "🔍 Checking npm installation..."
    
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        REQUIRED_VERSION="9.0.0"
        
        if [[ "$(printf '%s\n' "$REQUIRED_VERSION" "$NPM_VERSION" | sort -V | head -n1)" == "$REQUIRED_VERSION" ]]; then
            echo "✓ npm $NPM_VERSION (meets requirement: >= $REQUIRED_VERSION)"
            return 0
        else
            echo "⚠ npm $NPM_VERSION is older than recommended (>= $REQUIRED_VERSION)"
            return 0  # Non-blocking warning
        fi
    else
        echo "✗ npm not found"
        return 1
    fi
}

# Install root dependencies
install_root_deps() {
    echo ""
    echo "📦 Installing root dependencies..."
    
    if [[ -f "package.json" ]]; then
        npm install --no-fund --no-audit || {
            echo "❌ Failed to install root dependencies"
            return 1
        }
        echo "✓ Root dependencies installed"
    else
        echo "⚠ No root package.json found"
    fi
}

# Install workspace dependencies
install_workspace_deps() {
    echo ""
    echo "📦 Installing workspace dependencies..."
    
    if [[ -d "apps" ]]; then
        for app_dir in apps/*; do
            if [[ -d "$app_dir" ]] && [[ -f "$app_dir/package.json" ]]; then
                app_name="$(basename "$app_dir")"
                echo "  Installing dependencies for $app_name..."
                
                (cd "$app_dir" && npm install --no-fund --no-audit) || {
                    echo "  ❌ Failed to install dependencies for $app_name"
                    continue
                }
                echo "  ✓ $app_name dependencies installed"
            fi
        done
    fi
    
    if [[ -d "packages" ]]; then
        for pkg_dir in packages/*; do
            if [[ -d "$pkg_dir" ]] && [[ -f "$pkg_dir/package.json" ]]; then
                pkg_name="$(basename "$pkg_dir")"
                echo "  Installing dependencies for $pkg_name..."
                
                (cd "$pkg_dir" && npm install --no-fund --no-audit) || {
                    echo "  ❌ Failed to install dependencies for $pkg_name"
                    continue
                }
                echo "  ✓ $pkg_name dependencies installed"
            fi
        done
    fi
}

# Setup Git hooks
setup_git_hooks() {
    echo ""
    echo "🪝 Setting up Git hooks..."
    
    if command -v npx &> /dev/null && [[ -f "package.json" ]]; then
        if grep -q "husky" package.json 2>/dev/null; then
            npx husky install || {
                echo "⚠ Failed to setup Husky git hooks"
                return 0  # Non-blocking
            }
            echo "✓ Git hooks configured"
        else
            echo "⚠ Husky not configured in package.json"
        fi
    else
        echo "⚠ Cannot setup git hooks (npx not available or no package.json)"
    fi
}

# Create necessary directories
create_directories() {
    echo ""
    echo "📁 Creating necessary directories..."
    
    # Create logs directory for apps
    for app_dir in apps/*; do
        if [[ -d "$app_dir" ]]; then
            mkdir -p "$app_dir/logs"
        fi
    done
    
    # Create temp directories
    mkdir -p .tmp
    mkdir -p .sfs-backups
    
    echo "✓ Directories created"
}

# Main installation process
main() {
    echo "🚀 Starting SmartFlow Systems dependency installation..."
    echo ""
    
    # Prerequisites check
    if ! check_node_version; then
        echo ""
        echo "❌ Node.js requirements not met. Please install Node.js >= 18.0.0"
        echo "   Download from: https://nodejs.org/"
        exit 1
    fi
    
    if ! check_npm_version; then
        echo ""
        echo "❌ npm not available. Please install npm."
        exit 1
    fi
    
    # Installation steps
    install_root_deps || exit 1
    install_workspace_deps
    setup_git_hooks
    create_directories
    
    echo ""
    echo "🎉 Installation completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Configure environment variables: npm run setup:env"
    echo "2. Run health check: npm run health-check"
    echo "3. Start development: npm run dev"
    echo ""
    echo "📚 Available commands:"
    echo "  npm run dev          # Start all apps in development mode"
    echo "  npm run build        # Build all apps for production"
    echo "  npm run test         # Run all tests"
    echo "  npm run lint         # Lint all code"
    echo "  npm run health-check # Check system health"
    echo "  npm run backup       # Create system backup"
}

# Run main function
main "$@"