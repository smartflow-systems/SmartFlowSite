# Security Testing & Monitoring Guide

This guide provides comprehensive instructions for testing and monitoring the security fixes implemented in PR #153.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Automated Testing](#automated-testing)
- [Manual Testing](#manual-testing)
- [Security Monitoring](#security-monitoring)
- [CodeQL Validation](#codeql-validation)
- [Production Deployment](#production-deployment)

---

## Overview

**PR #153** addresses **28 CodeQL security vulnerabilities** (17 HIGH, 11 MEDIUM) across the SmartFlowSite codebase:

### Fixed Vulnerabilities
- ✅ ReDoS attacks (CWE-1333)
- ✅ Prototype pollution (CWE-1321)
- ✅ Missing rate limiting (CWE-770)
- ✅ Resource exhaustion (CWE-400)
- ✅ Unvalidated dynamic method calls (CWE-913)
- ✅ File system race conditions (CWE-367)
- ✅ Log injection (CWE-117)
- ✅ Network data written to file (CWE-73)

---

## Prerequisites

Before testing, ensure you have:

```bash
# Required tools
node --version   # v18+ required
npm --version    # v9+ required
curl --version   # For API testing
bc               # For time calculations (pentest script)

# Optional tools (recommended)
jq               # JSON parsing for advanced testing
ab               # Apache Bench for load testing
```

---

## Environment Setup

### 1. Configure Environment Variables

Copy the example file and configure production secrets:

```bash
cp .env.example .env
```

Edit `.env` and set **strong random values** for:

```bash
# Generate secure secrets
openssl rand -hex 32   # For ADMIN_API_KEY
openssl rand -base64 32  # For JWT_SECRET

# Required in production (minimum 16 characters)
ADMIN_API_KEY=<your-generated-key-here>
JWT_SECRET=<your-generated-secret-here>
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Application

```bash
# Terminal 1: Main application
npm start

# Terminal 2: Orchestrator (if testing workflow features)
npm run orchestrator
```

---

## Automated Testing

### Penetration Testing Suite

Run the comprehensive security test suite:

```bash
# Test localhost (default)
./scripts/security-pentest.sh

# Test specific URL
./scripts/security-pentest.sh https://smartflowsite.com https://smartflowsite.com:5001
```

**What it tests:**
- ✅ ReDoS protection (email validation, variable resolution)
- ✅ Prototype pollution (`__proto__`, `constructor`, `prototype`)
- ✅ Rate limiting (dashboard, API endpoints)
- ✅ Resource exhaustion (wait action capping)
- ✅ Dynamic method call validation (action whitelist)
- ✅ Path traversal (workflow ID sanitization)
- ✅ Log injection (newlines, ANSI escapes)
- ✅ Workflow validation (size limits, structure)

**Expected output:**
```
═══ Test Category 1: ReDoS Protection ═══
✅ PASS: Email validation rejects malformed input quickly (0.05s)
✅ PASS: Variable resolution handles malicious input safely

═══ Test Category 2: Prototype Pollution ═══
✅ PASS: __proto__ injection blocked
✅ PASS: constructor injection blocked
✅ PASS: prototype injection blocked

...

📊 Penetration Testing Summary
✅ Passed:  24 tests
❌ Failed:  0 tests
⊘ Skipped: 4 tests

Success Rate: 100.0%
✅ ALL TESTS PASSED
```

---

## Manual Testing

### Test 1: ReDoS Protection

**Email Validation:**
```bash
# Should complete instantly (not hang)
time curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "a@@@@@@@@@@@@@@@@@@@@@@@@@example.com"
  }'

# Expected: < 1 second, returns "Invalid email format"
```

**Variable Resolution:**
```bash
# Should not cause catastrophic backtracking
curl -X POST http://localhost:5001/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test",
    "steps": [{
      "action": "set-context",
      "input": {"var": "${{{{{{{{{{{nested}}}}}}}}}}}"}
    }]
  }'

# Expected: Quick response, validation error or processed safely
```

### Test 2: Prototype Pollution

```bash
# Attempt to pollute Object.prototype
curl -X POST http://localhost:5001/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "id": "pollution-test",
    "__proto__": {"isAdmin": true},
    "steps": []
  }'

# Expected: "Forbidden property: __proto__"
```

```bash
# Test set-context action
curl -X POST http://localhost:5001/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "id": "context-test",
    "steps": [{
      "action": "set-context",
      "input": {
        "constructor": "malicious"
      }
    }]
  }'

# Expected: "Forbidden property: constructor"
```

### Test 3: Rate Limiting

```bash
# Stress test dashboard endpoint (should trigger rate limit after 100 requests)
for i in {1..150}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/)
  echo "Request $i: $STATUS"
done

# Expected: First ~100 return 200, then 429 "Too Many Requests"
```

### Test 4: Resource Exhaustion

```bash
# Attempt to create infinite wait
time curl -X POST http://localhost:5001/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "id": "wait-test",
    "steps": [{
      "action": "wait",
      "input": {"duration": 999999999}
    }]
  }'

# Expected: Completes in ~60 seconds (not 999999999ms)
# Check logs for: "⚠️ Wait duration capped at 60000ms"
```

### Test 5: Dynamic Method Call Validation

```bash
# Attempt unauthorized action
curl -X POST http://localhost:5001/api/workflows/execute \
  -H "Content-Type: application/json" \
  -d '{
    "id": "eval-test",
    "steps": [{
      "action": "eval",
      "input": {"code": "console.log(process.env)"}
    }]
  }'

# Expected: "Unauthorized action: eval. Allowed: set-context, wait, log, store-state"
```

### Test 6: Path Traversal

```bash
# Attempt directory traversal
curl -X POST http://localhost:5001/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "id": "../../../etc/passwd",
    "steps": []
  }'

# Expected: "Invalid workflow id format"
```

### Test 7: Workflow Validation

```bash
# Attempt oversized workflow (>100 steps)
STEPS=$(python3 -c 'import json; print(json.dumps([{"action":"log","input":{"message":f"step{i}"}} for i in range(101)]))')

curl -X POST http://localhost:5001/api/workflows \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"big\",\"steps\":$STEPS}"

# Expected: "Too many workflow steps (max 100)"
```

```bash
# Attempt oversized workflow content (>1MB)
curl -X POST http://localhost:5001/api/workflows \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"huge\",\"data\":\"$(head -c 2000000 /dev/urandom | base64)\",\"steps\":[]}"

# Expected: "Workflow too large (max 1048576 bytes)"
```

---

## Security Monitoring

### Real-Time Monitoring

Monitor application logs for security events:

```bash
# Monitor in real-time
./scripts/security-monitor.sh

# Analyze existing log file
./scripts/security-monitor.sh /var/log/smartflow.log
```

**What it monitors:**
- 🚨 Critical alerts (missing secrets, JWT issues)
- ⚠️ Security warnings (ReDoS attempts, prototype pollution)
- ℹ️ Informational (rate limits, auth failures, validation)
- ✅ Security features (secrets validated, protections active)

**Example output:**
```
🔒 SmartFlow Security Monitor
════════════════════════════════════════════════════════════════

📡 Monitoring application logs in real-time...

✅ SECURITY: Production secrets validated successfully
⚠️  SECURITY WARNING: Prototype pollution attempt blocked
ℹ️  RATE LIMIT: Rate limit triggered
ℹ️  AUTH: Invalid authentication attempt

📋 Security Monitoring Summary
════════════════════════════════════════════════════════════════
🚨 Critical Alerts: 0
⚠️  Warnings: 1

⚠️  Attention: Security warnings detected.
   Review warnings and verify security controls are working as expected.
```

### Production Monitoring Recommendations

1. **Application Logs**
   ```bash
   # Tail production logs
   tail -f /var/log/smartflow/app.log | grep -E "SECURITY|WARNING|ERROR"
   ```

2. **Rate Limit Events**
   ```bash
   # Count rate limit events per hour
   grep "Too many requests" /var/log/smartflow/app.log | awk '{print $1" "$2}' | uniq -c
   ```

3. **Security Alert Dashboard**
   - Set up log aggregation (ELK, Splunk, CloudWatch)
   - Create alerts for patterns:
     - `⛔ CRITICAL`
     - `Forbidden property`
     - `Unauthorized action`
     - `path traversal detected`

---

## CodeQL Validation

### Before Merge

CodeQL runs automatically on pull requests. Check results:

```bash
# View PR checks
gh pr view 153 --json statusCheckRollup

# Expected: CodeQL status = SUCCESS
```

### After Merge

Verify all 28 alerts are resolved:

```bash
# View security alerts
gh api repos/smartflow-systems/SmartFlowSite/code-scanning/alerts \
  --jq '.[] | select(.state == "open") | {number, rule, state}'

# Expected: Empty array (no open alerts)
```

### Local CodeQL Analysis (Optional)

```bash
# Install CodeQL CLI
# https://github.com/github/codeql-cli-binaries

# Create database
codeql database create codeql-db --language=javascript

# Run analysis
codeql database analyze codeql-db \
  --format=sarif-latest \
  --output=results.sarif \
  javascript-security-and-quality.qls

# View results
codeql sarif-viewer results.sarif
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] All penetration tests pass
- [ ] Security monitor shows no critical alerts
- [ ] CodeQL analysis shows 0 open alerts
- [ ] Environment variables configured with strong secrets
- [ ] `.env` file **NOT** committed to git
- [ ] Production secrets validated at startup
- [ ] Rate limiting configured appropriately for production load
- [ ] Monitoring and alerting configured

### Deployment Steps

1. **Set Production Environment Variables**
   ```bash
   # On production server/platform
   export NODE_ENV=production
   export JWT_SECRET=$(openssl rand -base64 32)
   export ADMIN_API_KEY=$(openssl rand -hex 32)
   export STRIPE_SECRET_KEY=sk_live_YOUR_KEY
   export STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
   ```

2. **Validate Secrets**
   ```bash
   # Application will validate on startup
   npm start

   # Expected log output:
   # ✅ Production secrets validated
   # If secrets are missing/weak:
   # ⛔ CRITICAL: Missing or insecure secrets in production
   # (Application will exit with code 1)
   ```

3. **Run Post-Deployment Tests**
   ```bash
   # Test production URL
   ./scripts/security-pentest.sh https://your-domain.com https://your-domain.com:5001
   ```

4. **Monitor Initial Traffic**
   ```bash
   # Watch for security events
   ./scripts/security-monitor.sh /var/log/smartflow/app.log
   ```

### Post-Deployment Validation

**Week 1:**
- Monitor security logs daily
- Review rate limit events
- Check for authentication failures
- Verify no prototype pollution attempts succeed

**Week 2-4:**
- Weekly security log review
- Performance monitoring (ensure rate limiting doesn't impact legitimate users)
- Review any security warnings

**Monthly:**
- Run penetration test suite against production
- Review and update secrets if needed
- Update dependencies and re-run CodeQL

---

## Troubleshooting

### Common Issues

**Issue:** Application won't start with "CRITICAL: Missing or insecure secrets"

**Solution:**
```bash
# Check your .env file
cat .env | grep -E "JWT_SECRET|STRIPE|ADMIN_API_KEY"

# Ensure:
# 1. Variables are set (not empty)
# 2. Don't contain "change-in-production" or "your-secret-key"
# 3. Are at least 16 characters long
```

**Issue:** Rate limiting too aggressive

**Solution:**
```javascript
// Adjust in server/orchestrator/index.js
const dashboardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // Increase from 100
  // ...
});
```

**Issue:** Penetration tests timing out

**Solution:**
```bash
# Ensure services are running
curl http://localhost:3000/health
curl http://localhost:5001/health

# Check ports
lsof -i :3000
lsof -i :5001
```

---

## Additional Resources

- [PR #153: Security Fixes](https://github.com/smartflow-systems/SmartFlowSite/pull/153)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Database](https://cwe.mitre.org/)
- [CodeQL Documentation](https://codeql.github.com/docs/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

## Support

For security issues or questions:

1. **Review this guide** first
2. **Check PR #153** for implementation details
3. **Run security tests** to isolate the issue
4. **Review logs** with security monitor
5. **Create GitHub issue** with test results and logs

---

**Last Updated:** 2025-12-19
**Version:** 1.0.0
**PR:** #153
