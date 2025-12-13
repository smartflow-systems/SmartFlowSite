# Development Setup Guide

This guide covers setting up your development environment for contributing to SmartFlow Systems.

## 🛠️ Development Environment

### IDE Recommendations

#### Visual Studio Code (Recommended)
```bash
# Install recommended extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.vscode-json
```

**Recommended VS Code Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true
  }
}
```

#### WebStorm/IntelliJ
- Enable ESLint and Prettier integration
- Configure Node.js interpreter to project Node version
- Set up Run Configurations for each application

### Git Configuration

```bash
# Configure Git for the project
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Set up Git hooks (already done by npm run setup:deps)
npx husky install
```

## 🏃‍♂️ Development Workflow

### Starting Development

```bash
# Start all applications
npm run dev

# Or start individual applications
cd apps/main-site && npm run dev        # Port 3000
cd apps/ai-platform && npm run dev     # Port 3001
cd apps/social-booster && npm run dev  # Port 3002
cd apps/social-booster-ai && npm run dev # Port 3003
```

### Hot Reloading

All applications support hot reloading:
- **File changes** automatically restart the server
- **Frontend changes** refresh the browser
- **Configuration changes** may require manual restart

### Database Development

#### Local Database Setup

**PostgreSQL (Recommended)**:
```bash
# Install PostgreSQL locally
# Windows: Download from postgresql.org
# macOS: brew install postgresql && brew services start postgresql
# Linux: sudo apt-get install postgresql postgresql-contrib

# Create databases for each app
createdb smartflow_main
createdb smartflow_ai
createdb smartflow_social
createdb smartflow_social_ai
```

**Alternative: Docker**:
```bash
# Run PostgreSQL in Docker
docker run --name smartflow-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_USER=smartflow \
  -p 5432:5432 \
  -d postgres:15

# Create databases
docker exec -it smartflow-postgres createdb -U smartflow smartflow_main
docker exec -it smartflow-postgres createdb -U smartflow smartflow_ai
```

#### Database Migrations

```bash
# For apps using Prisma
cd apps/main-site
npx prisma migrate dev --name init
npx prisma generate

# For apps using custom migrations
cd apps/ai-platform
npm run migrate
```

### Testing

#### Running Tests

```bash
# Run all tests
npm run test

# Run tests for specific app
cd apps/main-site && npm test

# Run tests in watch mode
cd apps/main-site && npm run test:watch

# Run tests with coverage
npm run test -- --coverage
```

#### Test Structure

```
apps/main-site/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx
│   ├── utils/
│   │   ├── helpers.ts
│   │   └── helpers.test.ts
├── __tests__/
│   ├── integration/
│   └── e2e/
```

#### Writing Tests

**Unit Test Example**:
```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

**API Test Example**:
```typescript
// api.test.ts
import request from 'supertest'
import { app } from '../src/app'

describe('GET /api/health', () => {
  it('returns health status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200)
    
    expect(response.body).toEqual({ status: 'ok' })
  })
})
```

### Code Quality

#### Linting

```bash
# Lint all code
npm run lint

# Lint specific app
cd apps/main-site && npm run lint

# Fix linting errors
npm run lint -- --fix
```

#### Type Checking

```bash
# Type check all TypeScript
npm run type-check

# Type check specific app
cd apps/social-booster-ai && npm run type-check
```

#### Formatting

```bash
# Format code with Prettier
npx prettier --write .

# Check formatting
npx prettier --check .
```

### Debugging

#### VS Code Debugging

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Main Site",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/main-site/server.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "cwd": "${workspaceFolder}/apps/main-site"
    }
  ]
}
```

#### Browser Debugging

- Enable React Developer Tools for React applications
- Use browser network tab for API debugging  
- Check browser console for JavaScript errors

#### Server Debugging

```bash
# Debug with Node.js inspector
node --inspect apps/main-site/server.js

# Debug with detailed logging
DEBUG=* npm run dev
```

## 🔧 Development Tools

### Useful Commands

```bash
# Clean all builds and node_modules
npm run clean

# Update all dependencies
npm run update-deps

# Security audit
npm run security-audit

# Create backup before major changes
npm run backup
```

### Environment Management

#### Multiple Environment Files

```bash
apps/main-site/
├── .env.development     # Development settings
├── .env.staging        # Staging settings  
├── .env.production     # Production settings
└── .env.example        # Template file
```

#### Loading Environment Files

```javascript
// Load environment based on NODE_ENV
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
})
```

### Performance Monitoring

#### Development Metrics

```bash
# Monitor application performance
npm install -g clinic
clinic doctor -- node apps/main-site/server.js

# Memory usage monitoring
node --trace-warnings --inspect apps/main-site/server.js
```

#### Bundle Analysis (for frontend apps)

```bash
# Analyze bundle size
cd apps/social-booster-ai
npm run build
npm run analyze
```

## 📝 Development Guidelines

### Code Style

- **Use TypeScript** for new code where possible
- **Follow ESLint rules** - fix warnings and errors
- **Write tests** for new features and bug fixes
- **Use descriptive variable names** and comments
- **Keep functions small** and focused on single responsibility

### Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/amazing-feature

# 2. Make changes and commit frequently
git add .
git commit -m "feat: add amazing feature component"

# 3. Push to remote branch
git push origin feature/amazing-feature

# 4. Open Pull Request on GitHub
# 5. After review, merge to main
```

### Commit Messages

Follow conventional commits:
- `feat:` New features
- `fix:` Bug fixes  
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### Pull Request Process

1. **Create descriptive PR title and description**
2. **Include screenshots for UI changes**  
3. **Ensure all tests pass**
4. **Request review from team members**
5. **Address feedback promptly**
6. **Squash commits before merging**

## 🚨 Troubleshooting Development Issues

### Common Development Problems

#### Port Conflicts
```bash
# Find process using port
lsof -ti:3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

#### Module Resolution Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Database Connection Issues
```bash
# Check database status
pg_ctl status  # PostgreSQL

# Restart database
brew services restart postgresql  # macOS
sudo service postgresql restart  # Linux
```

#### Build Errors
```bash
# Clean build artifacts
npm run clean

# Rebuild everything
npm run build
```

---

**Next**: [Deployment Guide](./deployment.md) | **Back**: [Installation](./installation.md)