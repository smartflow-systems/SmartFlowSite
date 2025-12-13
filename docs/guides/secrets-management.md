# Secrets Management Guide

This guide covers how to securely manage secrets, API keys, and sensitive configuration in SmartFlow Systems.

## 🔐 Security Principles

### Never Commit Secrets
- **Never commit** `.env` files to version control
- **Always use** `.env.example` as templates
- **Rotate secrets** regularly
- **Use strong, unique** passwords and keys

### Environment Hierarchy
1. **Local Development** (`.env.local`)
2. **Shared Development** (`.env.development`)
3. **Staging Environment** (`.env.staging`)
4. **Production Environment** (`.env.production`)

## 🛡️ Environment Configuration

### Required Secrets by Application

#### Main Site (`apps/main-site`)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/smartflow_main
DB_ENCRYPT_KEY=32-character-encryption-key

# Authentication  
JWT_SECRET=super-secure-jwt-secret-key-minimum-32-chars
JWT_REFRESH_SECRET=different-refresh-secret-key-32-chars
SESSION_SECRET=express-session-secret-key-32-chars

# Payment Processing
STRIPE_PUBLISHABLE_KEY=pk_live_...  # or pk_test_...
STRIPE_SECRET_KEY=sk_live_...       # or sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="SmartFlow Systems <noreply@smartflow.systems>"

# External APIs
GOOGLE_ANALYTICS_ID=GA-XXXXXXXX-X
RECAPTCHA_SITE_KEY=6Lc...
RECAPTCHA_SECRET_KEY=6Lc...
```

#### AI Platform (`apps/ai-platform`)
```bash
# AI Service APIs
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_PALM_API_KEY=...
REPLICATE_API_TOKEN=r8_...

# Vector Database
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-west1-gcp
WEAVIATE_URL=https://...
WEAVIATE_API_KEY=...

# Knowledge Base
NOTION_TOKEN=secret_...
AIRTABLE_API_KEY=key...
AIRTABLE_BASE_ID=app...
```

#### Social Booster (`apps/social-booster`)
```bash
# Social Media APIs
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_SECRET=...
TWITTER_BEARER_TOKEN=...

FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
FACEBOOK_ACCESS_TOKEN=...

INSTAGRAM_ACCESS_TOKEN=...
INSTAGRAM_APP_ID=...
INSTAGRAM_APP_SECRET=...

LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...

# Analytics
GOOGLE_ANALYTICS_KEY=...
MIXPANEL_TOKEN=...
```

#### Social Booster AI (`apps/social-booster-ai`)
```bash
# Frontend Environment (NEXT_PUBLIC_ variables are exposed to browser)
NEXT_PUBLIC_API_URL=https://api.smartflow.systems
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Server-side Secrets
OPENAI_API_KEY=sk-...
REPLICATE_API_TOKEN=r8_...
UNSPLASH_ACCESS_KEY=...
PEXELS_API_KEY=...
```

## 🔧 Secret Management Tools

### Local Development

#### 1. Environment File Management
```bash
# Copy all environment templates
find apps -name ".env.example" -exec sh -c 'cp "$1" "${1%%.example}"' _ {} \;

# Validate all environment files
npm run setup:env
```

#### 2. Git Ignore Configuration
Ensure your `.gitignore` includes:
```gitignore
# Environment files
.env
.env.local
.env.*.local
.env.development.local
.env.staging.local
.env.production.local

# Sensitive files
*.key
*.pem
*.p12
secrets/
```

### Production Secrets Management

#### 1. GitHub Secrets (Recommended)
Store production secrets in GitHub repository secrets:

```bash
# Repository Settings > Secrets and variables > Actions
PRODUCTION_DATABASE_URL
PRODUCTION_JWT_SECRET  
PRODUCTION_STRIPE_SECRET_KEY
PRODUCTION_OPENAI_API_KEY
STAGING_DATABASE_URL
STAGING_JWT_SECRET
```

#### 2. Environment-Specific Deployment
```yaml
# .github/workflows/deploy.yml
- name: Deploy to Production
  env:
    DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}
    JWT_SECRET: ${{ secrets.PRODUCTION_JWT_SECRET }}
    STRIPE_SECRET_KEY: ${{ secrets.PRODUCTION_STRIPE_SECRET_KEY }}
```

#### 3. Cloud Provider Secrets
- **Vercel**: Environment Variables dashboard
- **Railway**: Environment Variables tab
- **Heroku**: Config Vars in Settings
- **AWS**: Systems Manager Parameter Store
- **Azure**: Key Vault
- **Google Cloud**: Secret Manager

## 🔐 Security Best Practices

### Secret Generation

#### Strong Random Secrets
```bash
# Generate JWT secrets (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate encryption keys (64 characters)  
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate session secrets
openssl rand -base64 32

# Generate UUID secrets
node -e "console.log(require('crypto').randomUUID())"
```

#### API Key Security
```bash
# Test API keys (safe for development)
OPENAI_API_KEY=sk-test-...
STRIPE_SECRET_KEY=sk_test_...

# Production API keys (secure)
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
```

### Environment Validation

Create validation scripts:
```javascript
// scripts/validate-env.js
const requiredSecrets = {
  'main-site': ['DATABASE_URL', 'JWT_SECRET', 'STRIPE_SECRET_KEY'],
  'ai-platform': ['OPENAI_API_KEY', 'DATABASE_URL'],
  'social-booster': ['TWITTER_API_KEY', 'FACEBOOK_APP_SECRET'],
  'social-booster-ai': ['OPENAI_API_KEY', 'NEXT_PUBLIC_API_URL']
}

function validateEnvironment(app) {
  const missing = requiredSecrets[app].filter(key => !process.env[key])
  if (missing.length > 0) {
    console.error(`❌ Missing required secrets for ${app}:`, missing)
    process.exit(1)
  }
  console.log(`✅ All required secrets present for ${app}`)
}
```

### Secret Rotation

#### Monthly Rotation Schedule
1. **Week 1**: Generate new secrets
2. **Week 2**: Update staging environment
3. **Week 3**: Update production environment  
4. **Week 4**: Revoke old secrets

#### Rotation Checklist
- [ ] Database passwords
- [ ] JWT secrets
- [ ] API keys (if possible)
- [ ] Webhook secrets
- [ ] Encryption keys
- [ ] Service tokens

## 🚨 Security Incidents

### Compromised Secret Response

#### Immediate Actions (First Hour)
1. **Revoke** the compromised secret immediately
2. **Generate** a new secret
3. **Update** all environments with new secret
4. **Notify** team members
5. **Monitor** for unauthorized access

#### Investigation (First Day)
1. **Review** access logs
2. **Check** for data breaches
3. **Audit** all related systems
4. **Document** the incident
5. **Update** security procedures

#### Prevention (First Week)
1. **Rotate** all related secrets
2. **Review** access permissions
3. **Update** security training
4. **Implement** additional monitoring
5. **Update** incident response procedures

### Monitoring & Alerts

#### Log Monitoring
```javascript
// Monitor for secret exposure in logs
const sensitivePatterns = [
  /sk-[a-zA-Z0-9]{32,}/,  // OpenAI keys
  /sk_live_[a-zA-Z0-9]{24,}/, // Stripe live keys
  /postgresql:\/\/[^@]*:[^@]*@/, // Database URLs with passwords
]

function scanLogs(logContent) {
  sensitivePatterns.forEach(pattern => {
    if (pattern.test(logContent)) {
      console.error('🚨 SECURITY ALERT: Potential secret exposed in logs!')
      // Alert security team
    }
  })
}
```

## 📋 Checklist for New Secrets

### Adding New Secrets
- [ ] Add to appropriate `.env.example` file
- [ ] Document in this secrets guide
- [ ] Add to environment validation script
- [ ] Update deployment configuration
- [ ] Test in staging environment
- [ ] Add to production secrets store
- [ ] Update team documentation

### Removing Secrets
- [ ] Remove from all `.env.example` files
- [ ] Update documentation
- [ ] Remove from validation scripts
- [ ] Remove from deployment configs
- [ ] Revoke from all environments
- [ ] Clean up any references in code

## 🔗 External Resources

- **OWASP Secrets Management**: https://owasp.org/www-community/vulnerabilities/
- **GitHub Secret Scanning**: https://docs.github.com/en/code-security/secret-scanning
- **12-Factor App Config**: https://12factor.net/config
- **NIST Cybersecurity Framework**: https://www.nist.gov/cyberframework

---

**Remember**: Security is everyone's responsibility. When in doubt, ask the security team or err on the side of caution.