#!/usr/bin/env bash
set -euo pipefail

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                    SMARTFLOW HEALTH CHECK                     ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Configuration
APPS_DIR="$(pwd)/apps"
TIMEOUT=10
EXIT_CODE=0

# Function to check service health
check_service_health() {
    local service_name="$1"
    local health_url="$2"
    local expected_status="${3:-200}"
    
    echo -n "Checking $service_name... "
    
    if command -v curl &> /dev/null; then
        response=$(curl -s -w "%{http_code}" -m $TIMEOUT "$health_url" --connect-timeout $TIMEOUT || echo "000")
        status_code="${response: -3}"
        
        if [[ "$status_code" == "$expected_status" ]]; then
            echo "✓ Healthy (HTTP $status_code)"
        else
            echo "✗ Unhealthy (HTTP $status_code)"
            EXIT_CODE=1
        fi
    else
        echo "⚠ curl not available, skipping HTTP check"
    fi
}

# Function to check app directory and configuration
check_app_config() {
    local app_path="$1"
    local app_name="$(basename "$app_path")"
    
    echo -n "Checking $app_name configuration... "
    
    if [[ -f "$app_path/package.json" ]]; then
        if [[ -f "$app_path/.env.example" ]] || [[ -f "$app_path/.env" ]]; then
            echo "✓ Configured"
        else
            echo "⚠ Missing environment configuration"
        fi
    else
        echo "✗ Missing package.json"
        EXIT_CODE=1
    fi
}

echo "🔍 Checking application configurations..."
if [[ -d "$APPS_DIR" ]]; then
    for app_dir in "$APPS_DIR"/*; do
        if [[ -d "$app_dir" ]]; then
            check_app_config "$app_dir"
        fi
    done
else
    echo "⚠ Apps directory not found: $APPS_DIR"
fi

echo ""
echo "🌐 Checking service health endpoints..."

# Check common health endpoints
check_service_health "Main Site" "http://localhost:3000/health"
check_service_health "Main Site (Alt)" "http://localhost:5000/health"
check_service_health "AI Platform" "http://localhost:3001/health"
check_service_health "API Server" "http://localhost:8080/health"

echo ""
echo "🔧 Checking system dependencies..."

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js: $NODE_VERSION"
else
    echo "✗ Node.js not found"
    EXIT_CODE=1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✓ npm: $NPM_VERSION"
else
    echo "✗ npm not found"
    EXIT_CODE=1
fi

# Check Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo "✓ $GIT_VERSION"
else
    echo "✗ Git not found"
    EXIT_CODE=1
fi

echo ""
if [[ $EXIT_CODE -eq 0 ]]; then
    echo "🎉 All health checks passed!"
else
    echo "❌ Some health checks failed!"
fi

exit $EXIT_CODE