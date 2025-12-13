#!/usr/bin/env bash
set -euo pipefail

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║               SMARTFLOW ENVIRONMENT SETUP                     ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Function to create .env.example if it doesn't exist
create_env_example() {
    local app_path="$1"
    local app_name="$(basename "$app_path")"
    local env_file="$app_path/.env.example"
    
    if [[ ! -f "$env_file" ]]; then
        echo "Creating $env_file for $app_name..."
        
        cat > "$env_file" << 'EOF'
# Application Configuration
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/smartflow_db

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# External APIs
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Cloud Storage (Optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Analytics (Optional)
GOOGLE_ANALYTICS_ID=GA-XXXXXXXX-X

# Logging
LOG_LEVEL=info

# CORS Settings
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# SmartFlow Specific
SFS_PAT=your-sfs-personal-access-token
SFS_SYNC_URL=https://api.smartflow.example.com
REPLIT_TOKEN=your-replit-token
EOF
        echo "✓ Created $env_file"
    else
        echo "✓ $env_file already exists"
    fi
}

# Function to validate environment variables
validate_env() {
    local app_path="$1"
    local app_name="$(basename "$app_path")"
    local env_file="$app_path/.env"
    local env_example="$app_path/.env.example"
    
    echo "Validating $app_name environment..."
    
    if [[ -f "$env_example" ]] && [[ -f "$env_file" ]]; then
        # Check if all example vars are present in .env
        missing_vars=()
        while IFS= read -r line; do
            if [[ "$line" =~ ^[A-Z_]+=.* ]]; then
                var_name="${line%%=*}"
                if ! grep -q "^${var_name}=" "$env_file" 2>/dev/null; then
                    missing_vars+=("$var_name")
                fi
            fi
        done < "$env_example"
        
        if [[ ${#missing_vars[@]} -gt 0 ]]; then
            echo "⚠ Missing environment variables in $app_name:"
            printf "    • %s\n" "${missing_vars[@]}"
            return 1
        else
            echo "✓ All environment variables present"
            return 0
        fi
    elif [[ ! -f "$env_file" ]]; then
        echo "⚠ No .env file found (copy from .env.example)"
        return 1
    else
        echo "✓ Environment file exists"
        return 0
    fi
}

echo "🔧 Setting up environment configurations..."

# Process each app directory
if [[ -d "apps" ]]; then
    for app_dir in apps/*; do
        if [[ -d "$app_dir" ]] && [[ -f "$app_dir/package.json" ]]; then
            app_name="$(basename "$app_dir")"
            echo ""
            echo "📦 Processing $app_name..."
            
            # Create .env.example if missing
            create_env_example "$app_dir"
            
            # Validate existing .env
            validate_env "$app_dir" || true
        fi
    done
else
    echo "⚠ Apps directory not found. Creating example configuration..."
    mkdir -p apps/example
    create_env_example "apps/example"
fi

echo ""
echo "📋 Environment Setup Summary:"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env in each app directory"
echo "2. Fill in your actual values in each .env file"
echo "3. Never commit .env files to version control"
echo "4. Use .env.example as a template for new environments"
echo ""
echo "Commands to copy environment files:"
for app_dir in apps/*; do
    if [[ -d "$app_dir" ]] && [[ -f "$app_dir/.env.example" ]]; then
        app_name="$(basename "$app_dir")"
        echo "  cp apps/$app_name/.env.example apps/$app_name/.env"
    fi
done

echo ""
echo "✅ Environment configuration setup completed!"