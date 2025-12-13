# Installation Guide

Welcome to SmartFlow Systems! This guide will help you set up the entire platform on your local machine or server.

## 🔧 System Requirements

### Minimum Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher (comes with Node.js)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space for development environment

### Recommended Setup
- **Node.js**: Latest LTS version (20.x)
- **RAM**: 16GB for optimal performance with all services
- **Storage**: SSD recommended for faster builds
- **Terminal**: PowerShell (Windows), Terminal (macOS), or Bash (Linux)

## 📥 Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/smartflow-systems/SmartFlowSite.git
cd SmartFlowSite
```

### 2. Install Dependencies

Run the automated installer:

```bash
npm run setup:deps
```

This will:
- ✅ Check Node.js and npm versions
- ✅ Install root dependencies
- ✅ Install dependencies for all apps
- ✅ Set up Git hooks (Husky)
- ✅ Create necessary directories

### 3. Configure Environment Variables

Set up environment variables for all applications:

```bash
npm run setup:env
```

This creates `.env.example` files for each app. Copy them to `.env`:

```bash
# Copy environment templates
cp apps/main-site/.env.example apps/main-site/.env
cp apps/ai-platform/.env.example apps/ai-platform/.env
cp apps/social-booster/.env.example apps/social-booster/.env
cp apps/social-booster-ai/.env.example apps/social-booster-ai/.env
```

### 4. Configure Your Environment Files

Edit each `.env` file with your actual values:

#### Main Site (`apps/main-site/.env`)
```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/smartflow_main
JWT_SECRET=your-super-secret-jwt-key-here
```

#### AI Platform (`apps/ai-platform/.env`)
```bash
NODE_ENV=development  
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/smartflow_ai
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

#### Social Booster (`apps/social-booster/.env`)
```bash
NODE_ENV=development
PORT=3002
TWITTER_API_KEY=your-twitter-api-key
FACEBOOK_APP_ID=your-facebook-app-id
INSTAGRAM_ACCESS_TOKEN=your-instagram-token
```

#### Social Booster AI (`apps/social-booster-ai/.env`)
```bash
NODE_ENV=development
PORT=3003
NEXT_PUBLIC_API_URL=http://localhost:3001
OPENAI_API_KEY=sk-...
```

### 5. Verify Installation

Run the health check to ensure everything is configured correctly:

```bash
npm run health-check
```

You should see output like:
```
╔═══════════════════════════════════════════════════════════════╗
║                    SMARTFLOW HEALTH CHECK                     ║
╚═══════════════════════════════════════════════════════════════╝

🔍 Checking application configurations...
✓ main-site configuration... ✓ Configured
✓ ai-platform configuration... ✓ Configured
✓ social-booster configuration... ✓ Configured
✓ social-booster-ai configuration... ✓ Configured

🔧 Checking system dependencies...
✓ Node.js: v20.10.0
✓ npm: 10.2.3
✓ git version 2.42.0

🎉 All health checks passed!
```

## 🚀 Start Development

Start all applications in development mode:

```bash
npm run dev
```

This will start:
- **Main Site**: http://localhost:3000
- **AI Platform**: http://localhost:3001  
- **Social Booster**: http://localhost:3002
- **Social Booster AI**: http://localhost:3003

## 🔍 Troubleshooting

### Common Issues

#### Node.js Version Error
```bash
Error: Node.js version 16.x.x is too old (requires >= 18.0.0)
```
**Solution**: Install Node.js 18+ from [nodejs.org](https://nodejs.org/)

#### Port Already in Use
```bash
Error: Port 3000 is already in use
```
**Solution**: Kill the process or change the port in `.env`:
```bash
# Kill process on Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on macOS/Linux  
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3005
```

#### Database Connection Error
```bash
Error: Connection refused to postgresql://...
```
**Solution**: Install and start PostgreSQL, or use a cloud database:
```bash
# Install PostgreSQL locally
# Windows: Download from postgresql.org
# macOS: brew install postgresql
# Ubuntu: apt-get install postgresql

# Or use cloud services:
# - Supabase (free tier): supabase.com
# - Railway: railway.app
# - Neon: neon.tech
```

#### Missing Environment Variables
```bash
Error: JWT_SECRET is required
```
**Solution**: Ensure all required variables are set in your `.env` files

### Getting Help

If you encounter issues:

1. **Check the logs**: Look at terminal output for specific error messages
2. **Review configuration**: Ensure all `.env` files are properly configured
3. **Restart services**: Sometimes a fresh restart resolves issues
4. **Check ports**: Ensure no port conflicts exist
5. **Update dependencies**: Run `npm run setup:deps` again

## 📚 Next Steps

After successful installation:

1. **[Development Setup](./development-setup.md)** - Configure your development environment
2. **[Architecture Overview](../architecture/overview.md)** - Understand the system architecture  
3. **[API Documentation](../api/)** - Explore the API endpoints
4. **[Deployment Guide](./deployment.md)** - Learn how to deploy to production

## 🔒 Security Notes

- Never commit `.env` files to version control
- Use strong, unique passwords for all services
- Rotate API keys regularly
- Enable two-factor authentication where possible
- Use HTTPS in production environments

---

**Need help?** Check our [troubleshooting guide](../guides/troubleshooting.md) or [open an issue](https://github.com/smartflow-systems/SmartFlowSite/issues).