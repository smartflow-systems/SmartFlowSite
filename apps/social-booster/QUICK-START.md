# SocialScaleBooster - Quick Start Guide

**30-Second Setup** | SmartFlow Systems

---

## 1. Apply Modernization (First Time)

```bash
cd SocialScaleBooster
bash sfs-modernization-apply.sh
```

This script will:
- Create backups in `.sfs-backups/`
- Install dependencies
- Remove legacy `server.js`
- Commit all changes

---

## 2. Configure Environment

```bash
# Copy template
cp .env.example .env

# Edit with your credentials
nano .env  # or use your preferred editor
```

**Required variables:**
```env
DATABASE_URL=postgresql://...        # Get from Neon
JWT_SECRET=generate-secure-key       # openssl rand -base64 32
STRIPE_SECRET_KEY=sk_test_...       # From Stripe dashboard
```

---

## 3. Setup Database

```bash
npm run migrate
```

---

## 4. Start Development

```bash
npm run dev
```

Visit: **http://localhost:5000**

---

## Quick Commands

```bash
# Development
npm run dev              # Start with hot reload
npm run db:studio        # Open database GUI

# Testing
npm test                 # Run test suite
npm run lint             # Check code quality

# Production
npm run build            # Build for production
npm start                # Start production server

# Git
git status               # Check changes
git push origin main     # Deploy (triggers CI/CD)
```

---

## Rollback (If Needed)

```bash
bash sfs-modernization-rollback.sh
```

Restores from latest backup in `.sfs-backups/`

---

## File Locations

```
server/index.ts              # Server entry point
server/auth/index.ts         # Auth endpoints
server/middleware/auth.ts    # JWT middleware
client/src/index.css         # SFS theme
.github/workflows/           # CI/CD
.env                         # Your config (don't commit!)
```

---

## API Test

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

---

## Troubleshooting

**Port 5000 in use?**
```bash
lsof -ti:5000 | xargs kill -9
```

**Database connection failed?**
- Check `.env` for correct `DATABASE_URL`
- Verify Neon project is running
- Test connection: `psql $DATABASE_URL`

**Build errors?**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## GitHub Secrets (For CI/CD)

**Settings → Secrets and variables → Actions:**

| Secret | Description | Required |
|--------|-------------|----------|
| `SFS_PAT` | GitHub token (repo+workflow) | ✅ Yes |
| `REPLIT_TOKEN` | Replit deploy token | ❌ Optional |
| `SFS_SYNC_URL` | Webhook URL | ❌ Optional |

---

## Documentation

- **Full Guide:** `README.md` (500+ lines)
- **Changes:** `MODERNIZATION-SUMMARY.md`
- **This File:** Quick reference

---

**SmartFlow Systems** | [smartflow-systems](https://github.com/smartflow-systems)
