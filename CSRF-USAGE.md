# CSRF Protection Usage Guide

## Overview

SmartFlowSite implements CSRF (Cross-Site Request Forgery) protection using double-submit cookie pattern to prevent unauthorized state-changing requests.

## Protected Endpoints

The following endpoints require a valid CSRF token:

- `POST /api/leads` - Submit lead form data
- `POST /api/stripe/checkout` - Create Stripe checkout session

Webhooks are exempt from CSRF protection as they use other authentication methods.

## How to Use CSRF Tokens

### Step 1: Fetch CSRF Token

Before making any protected POST request, fetch a CSRF token:

```javascript
async function getCsrfToken() {
  const response = await fetch('/api/csrf-token', {
    credentials: 'include' // Important: Include cookies
  });
  const data = await response.json();
  return data.csrfToken;
}
```

### Step 2: Include Token in Requests

Include the token in the `x-csrf-token` header or as `_csrf` in the request body:

**Option A: Using Header (Recommended)**

```javascript
async function submitLead(formData) {
  const csrfToken = await getCsrfToken();

  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken  // Add CSRF token header
    },
    credentials: 'include', // Include cookies
    body: JSON.stringify(formData)
  });

  return response.json();
}
```

**Option B: Using Request Body**

```javascript
async function submitLead(formData) {
  const csrfToken = await getCsrfToken();

  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      ...formData,
      _csrf: csrfToken  // Add CSRF token to body
    })
  });

  return response.json();
}
```

## Complete Example: Lead Form Submission

```html
<!DOCTYPE html>
<html>
<head>
  <title>Lead Form with CSRF Protection</title>
</head>
<body>
  <form id="leadForm">
    <input type="text" name="firstName" placeholder="First Name" required>
    <input type="text" name="lastName" placeholder="Last Name" required>
    <input type="email" name="email" placeholder="Email" required>
    <button type="submit">Submit</button>
  </form>

  <script>
    document.getElementById('leadForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      // Get form data
      const formData = {
        firstName: e.target.firstName.value,
        lastName: e.target.lastName.value,
        email: e.target.email.value
      };

      try {
        // Fetch CSRF token
        const tokenResponse = await fetch('/api/csrf-token', {
          credentials: 'include'
        });
        const { csrfToken } = await tokenResponse.json();

        // Submit form with CSRF token
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken
          },
          credentials: 'include',
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
          alert('Lead submitted successfully!');
        } else {
          alert('Error: ' + result.message);
        }
      } catch (error) {
        console.error('Submission error:', error);
        alert('Failed to submit form');
      }
    });
  </script>
</body>
</html>
```

## Complete Example: Stripe Checkout

```javascript
async function createCheckoutSession(planId) {
  try {
    // Fetch CSRF token
    const tokenResponse = await fetch('/api/csrf-token', {
      credentials: 'include'
    });
    const { csrfToken } = await tokenResponse.json();

    // Create checkout session with CSRF token
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken
      },
      credentials: 'include',
      body: JSON.stringify({
        planId: planId,
        successUrl: window.location.origin + '/success',
        cancelUrl: window.location.origin + '/pricing'
      })
    });

    const result = await response.json();

    if (result.success) {
      // Redirect to Stripe Checkout
      window.location.href = result.url;
    } else {
      alert('Error: ' + result.message);
    }
  } catch (error) {
    console.error('Checkout error:', error);
    alert('Failed to create checkout session');
  }
}
```

## Error Handling

If CSRF validation fails, you'll receive a 403 Forbidden response:

```json
{
  "error": "CSRF validation failed"
}
```

**Common Issues:**

1. **Missing Token**: Ensure you fetch and include the CSRF token in every protected request
2. **Missing Cookies**: Always include `credentials: 'include'` in fetch requests
3. **Token Expired**: CSRF tokens are tied to the session cookie - refetch if needed
4. **Wrong Origin**: CSRF cookies use `sameSite: 'strict'` - requests from different domains won't work

## Security Best Practices

1. **Always use HTTPS in production** - CSRF cookies are marked `secure: true` in production
2. **Never expose CSRF tokens in URLs** - Use headers or request body only
3. **Fetch fresh tokens** - Don't cache CSRF tokens for long periods
4. **Enable credentials** - Always include `credentials: 'include'` for cookie support

## Configuration

CSRF protection is configured in `server.js`:

- **Cookie Name**: `__Host-psifi.x-csrf-token`
- **Cookie Options**: `httpOnly`, `sameSite: strict`, `secure` (in production)
- **Token Size**: 64 bytes
- **Ignored Methods**: `GET`, `HEAD`, `OPTIONS` (read-only operations)

## Environment Variables

Set in `.env`:

```bash
CSRF_SECRET="your-random-secret-here"
# Falls back to SESSION_SECRET if CSRF_SECRET is not set
```

Generate a secure secret:

```bash
openssl rand -hex 32
```

---

**Last Updated:** 2025-12-27
**Status:** CSRF protection active on all state-changing endpoints
