# Security Policy - SmartFlowSite

## Overview

This document outlines the security measures implemented in SmartFlowSite and provides guidelines for maintaining security.

## Security Features Implemented

### 1. Security Headers (Helmet.js)

- **Content Security Policy (CSP)**: Prevents XSS attacks by controlling resource loading
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME-sniffing attacks
- **Strict-Transport-Security**: Enforces HTTPS connections
- **X-DNS-Prefetch-Control**: Controls DNS prefetching

### 2. Rate Limiting

- **API Rate Limit**: 100 requests per 15 minutes per IP
- **Auth Rate Limit**: 5 authentication attempts per 15 minutes per IP
- Prevents brute force attacks and DoS attempts

### 3. CORS Configuration

- **Development**: Allows all origins (*)
- **Production**: Restricted to trusted domains only
- Credentials support enabled for authenticated requests

### 4. Authentication

- **Admin Endpoints**: Protected with API key authentication
- **GET /api/leads**: Requires `Authorization` header with API key
- Uses `ADMIN_API_KEY` environment variable

### 5. Input Validation

- **Email Validation**: Regex-based email format validation
- **Required Fields**: First name, last name, and email validation
- **Sanitization**: Log output sanitization to prevent log injection

### 6. Dependency Security

- Regular `npm audit` checks for vulnerabilities
- Automated dependency updates via GitHub Actions
- Zero high-severity vulnerabilities maintained

## Protected Endpoints

### Admin Endpoints (Authentication Required)

- `GET /api/leads` - Retrieve all captured leads

**Authentication Header:**
```http
Authorization: Bearer YOUR_ADMIN_API_KEY
```

### Public Endpoints (No Authentication)

- `GET /health` - Health check
- `GET /api/health` - API health check
- `POST /api/leads` - Submit new lead (rate limited)
- `POST /api/stripe/checkout` - Initiate checkout (rate limited)

## Environment Variables Security

### Critical Environment Variables

1. **ADMIN_API_KEY** (Required for production)
   - Controls access to admin endpoints
   - Generate: `openssl rand -hex 32`
   - **NEVER** use default values in production

2. **JWT_SECRET** (Required if using JWT auth)
   - Used for signing authentication tokens
   - Generate: `openssl rand -base64 32`
   - **NEVER** use default values in production

3. **OPENAI_API_KEY** (Required for AI features)
   - OpenAI API access key
   - Store in Replit Secrets or secure vault

4. **SFS_PAT** (Required for GitHub integration)
   - GitHub Personal Access Token
   - Store in Replit Secrets or secure vault

### .env File Protection

- `.env` is in `.gitignore` - **NEVER** commit to git
- Use `.env.example` as template
- Replit Secrets recommended for production

## Production Security Checklist

### Before Deploying to Production

- [ ] Generate strong `ADMIN_API_KEY` using `openssl rand -hex 32`
- [ ] Generate strong `JWT_SECRET` using `openssl rand -base64 32`
- [ ] Update CORS origins to production domains only
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/TLS
- [ ] Configure rate limits appropriately for your traffic
- [ ] Run `npm audit` and fix all vulnerabilities
- [ ] Remove all test/debug endpoints
- [ ] Review and minimize CSP directives
- [ ] Enable security logging and monitoring
- [ ] Configure backup strategy for leads data
- [ ] Set up intrusion detection
- [ ] Configure firewall rules

### Regular Maintenance

- [ ] Weekly `npm audit` checks
- [ ] Monthly dependency updates
- [ ] Quarterly security reviews
- [ ] Review access logs for suspicious activity
- [ ] Rotate API keys every 90 days
- [ ] Backup leads database regularly

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please email:
**security@smartflowsystems.com**

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

**Do not** publicly disclose vulnerabilities until they have been addressed.

## Security Best Practices for Developers

### 1. Never Hardcode Secrets
```javascript
// ❌ BAD
const apiKey = "sk-1234567890abcdef";

// ✅ GOOD
const apiKey = process.env.ADMIN_API_KEY;
```

### 2. Validate All Input
```javascript
// ✅ GOOD - Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({ message: "Invalid email" });
}
```

### 3. Use Prepared Statements (When using SQL)
```javascript
// ❌ BAD - SQL Injection vulnerable
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ GOOD - Parameterized query
const query = 'SELECT * FROM users WHERE email = ?';
db.query(query, [email]);
```

### 4. Sanitize Output
```javascript
// ✅ GOOD - Sanitize before logging
console.log(`New lead: ${sanitizeForLog(email)}`);
```

### 5. Use HTTPS Only
- Never transmit sensitive data over HTTP
- Enable HSTS headers
- Redirect HTTP to HTTPS

### 6. Implement Principle of Least Privilege
- Grant minimum necessary permissions
- Use role-based access control
- Regularly audit permissions

## Security Headers Reference

### Helmet Configuration
```javascript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"]
    }
  }
})
```

## Rate Limiting Configuration

### Standard API Rate Limit
```javascript
{
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
  message: "Too many requests from this IP"
}
```

### Auth Endpoint Rate Limit
```javascript
{
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 attempts per window
  message: "Too many authentication attempts"
}
```

## Incident Response

### In Case of Security Breach

1. **Immediate Actions**
   - Rotate all API keys and secrets
   - Review access logs
   - Identify affected systems/data
   - Document the incident

2. **Communication**
   - Notify affected users (if applicable)
   - Report to security team
   - Coordinate with stakeholders

3. **Remediation**
   - Patch vulnerabilities
   - Update security controls
   - Conduct post-mortem analysis
   - Update security documentation

## Compliance

- **GDPR**: User data protection and privacy
- **PCI DSS**: Payment card data security (via Stripe)
- **SOC 2**: Security controls and monitoring

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)

---

**Last Updated:** 2025-12-07
**Version:** 1.0.0
**Maintainer:** SmartFlow Systems Security Team
