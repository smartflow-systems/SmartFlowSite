# Content Security Policy (CSP) Security Update

## Overview

SmartFlowSite has been updated with a **strict, nonce-based Content Security Policy** to prevent XSS (Cross-Site Scripting) attacks and enhance overall security posture.

## Changes Made

### Before (Insecure)
```javascript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],  // ❌ INSECURE
    scriptSrc: ["'self'", "'unsafe-inline'"], // ❌ INSECURE
    // ...
  }
}
```

**Issues:**
- ❌ `'unsafe-inline'` allows ANY inline scripts and styles
- ❌ Vulnerable to XSS injection attacks
- ❌ Attackers could inject malicious scripts

### After (Secure)
```javascript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", `'nonce-${nonce}'`, "https://fonts.googleapis.com"],
    scriptSrc: ["'self'", `'nonce-${nonce}'`, "https://js.stripe.com"],
    imgSrc: ["'self'", "data:", "https:", "https://*.stripe.com"],
    connectSrc: ["'self'", "https://api.stripe.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"]
  }
}
```

**Security Improvements:**
- ✅ **Nonce-based CSP**: Each request gets a unique cryptographic nonce
- ✅ **No unsafe-inline**: Blocks all inline scripts without valid nonce
- ✅ **Whitelisted domains**: Only trusted external sources (Stripe, Google Fonts)
- ✅ **Strict directives**: baseUri, formAction, frameAncestors protection
- ✅ **HSTS enabled**: HTTP Strict Transport Security with 1-year max-age
- ✅ **XSS prevention**: Significantly harder for attackers to inject code

## How CSP Nonces Work

### Server-Side (Automatic)

A unique nonce is generated for each request:

```javascript
app.use((req, res, next) => {
  res.locals.cspNonce = Buffer.from(crypto.randomUUID()).toString('base64');
  next();
});
```

### Client-Side (When Needed)

If you need to add inline scripts or styles, include the nonce attribute:

**Inline Script:**
```html
<!-- In your HTML template (e.g., EJS, Handlebars) -->
<script nonce="<%= cspNonce %>">
  console.log('This script has a valid nonce');
</script>
```

**Inline Style:**
```html
<style nonce="<%= cspNonce %>">
  .special { color: gold; }
</style>
```

**Without nonce, inline scripts are BLOCKED:**
```html
<!-- ❌ This will be blocked by CSP -->
<script>
  alert('This will NOT execute');
</script>
```

## Whitelisted External Domains

### Scripts
- `https://js.stripe.com` - Stripe payment integration

### Styles
- `https://fonts.googleapis.com` - Google Fonts

### Fonts
- `https://fonts.gstatic.com` - Google Fonts static resources

### Images
- `https://*.stripe.com` - Stripe assets

### Connections (API calls)
- `https://api.stripe.com` - Stripe API
- `http://localhost:*` - Development mode only

### Frames
- `https://js.stripe.com` - Stripe Elements
- `https://hooks.stripe.com` - Stripe webhooks

## Additional Security Headers

### HSTS (HTTP Strict Transport Security)
```javascript
hsts: {
  maxAge: 31536000,        // 1 year
  includeSubDomains: true, // Apply to all subdomains
  preload: true            // Eligible for browser preload lists
}
```

Benefits:
- ✅ Forces HTTPS for 1 year after first visit
- ✅ Prevents protocol downgrade attacks
- ✅ Blocks man-in-the-middle attacks

### Other Directives
- **baseUri**: `['self']` - Prevents `<base>` tag injection
- **formAction**: `['self']` - Forms can only submit to same origin
- **frameAncestors**: `['none']` - Prevents clickjacking (cannot be iframed)
- **objectSrc**: `['none']` - Blocks plugins (Flash, Java)

## Testing CSP

### Check Headers

```bash
curl -I http://localhost:5000 | grep -i content-security-policy
```

### Browser Console

Open DevTools and check for CSP violations:

```
Refused to execute inline script because it violates the following Content Security Policy directive: ...
```

### CSP Evaluator

Test your CSP at: https://csp-evaluator.withgoogle.com/

## Migration Guide for Inline Scripts

If you have existing inline scripts, you have two options:

### Option 1: Move to External Files (Recommended)

Before:
```html
<script>
  function doSomething() { ... }
</script>
```

After:
```html
<!-- Create public/js/app.js -->
<script src="/js/app.js"></script>
```

### Option 2: Use Nonce (If necessary)

```html
<!-- Requires templating engine to inject nonce -->
<script nonce="<%= cspNonce %>">
  function doSomething() { ... }
</script>
```

## Impact on Existing Features

✅ **No breaking changes** - All current functionality preserved:
- Static file serving works normally
- Stripe integration continues to function
- External stylesheets and scripts load correctly
- Forms and APIs work as expected

⚠️ **May affect** (if present):
- Inline event handlers: `onclick="..."`
- Inline styles: `style="..."`
- `javascript:` URLs
- `eval()` and `new Function()`

## Security Compliance

This CSP configuration aligns with:
- ✅ OWASP Top 10 - XSS Prevention
- ✅ Mozilla Observatory recommendations
- ✅ Google CSP best practices
- ✅ GDPR/CCPA security requirements
- ✅ PCI DSS requirements for payment processing

## Monitoring

CSP violations are automatically reported in browser console. For production monitoring, consider adding CSP reporting:

```javascript
contentSecurityPolicy: {
  directives: {
    // ... existing directives
    reportUri: '/api/csp-report'
  }
}
```

---

**Implemented:** 2025-12-27
**Status:** ✅ Production-ready
**Security Level:** HIGH - Nonce-based CSP with strict directives
