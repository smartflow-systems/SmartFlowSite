# AI Agent Guidelines for SmartFlow Systems

## Project Context
SmartFlow Systems (SFS) is a suite of AI-powered business automation tools including:
- **SocialScaleBooster**: Social media content generation for barbers, salons, gyms
- **AP-CRM**: Appointment and customer relationship management

## Development Standards

### Code Quality
- Follow TypeScript/Python best practices
- Use type safety (TypeScript strict mode, Python type hints)
- Write self-documenting code with clear variable names
- Add comments only for complex business logic

### Git Workflow
- Direct push to `main` branch (no PR required for solo dev)
- Commit messages: `<type>: <description>` (e.g., "feat: add user auth")
- CI/CD runs automatically on push

### Brand Guidelines
- Colors: Black #0D0D0D, Brown #3B2F2F, Gold #FFD700
- Use glassmorphism design patterns
- Maintain consistency across all SFS apps

### Security
- Never commit secrets (use Replit Secrets or environment variables)
- Always use parameterized queries for database operations
- Sanitize user input with DOMPurify for innerHTML usage

### AI Assistant Usage
- Review all AI-generated code before committing
- Test functionality locally before pushing
- Validate security implications of suggested code
- Use AI for boilerplate, refactoring, and documentation

## Stack
- Frontend: React 18/19, TypeScript, Tailwind, Radix UI
- Backend: Node.js, Python FastAPI, Prisma ORM
- Deployment: Replit, GitHub Actions CI/CD
- Health checks: All apps expose `/health` endpoint
