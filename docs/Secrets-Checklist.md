# Secrets Checklist

Never store secret values in docs, screenshots, commits, or chat.

## GitHub Org Secrets
- SFS_PAT
- REPLIT_TOKEN
- SFS_SYNC_URL

## Runtime/App Secrets
Each app may need its own separate values:
- DATABASE_URL
- JWT_SECRET
- SESSION_SECRET
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- OPENAI_API_KEY
- ANTHROPIC_API_KEY
- SENDGRID_API_KEY

## Rules
- Same secret name can exist in multiple repos.
- Secret value should be separate per app when it protects app-specific data.
- DATABASE_URL should usually be different per app/database.
- Never commit .env files except .env.example.
