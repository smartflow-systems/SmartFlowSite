# Stripe Webhook Setup Guide - SmartFlowSite

## 🎯 Purpose

Webhooks allow Stripe to notify your server when important events happen (payments, subscription changes, etc.). This guide shows you how to set them up for LIVE mode.

---

## 📋 Step-by-Step Setup

### Step 1: Access Stripe Webhooks Dashboard

1. Go to **https://dashboard.stripe.com/**
2. **Toggle to LIVE mode** (top right corner - should NOT say "Test mode")
3. Click **Developers** in the left sidebar
4. Click **Webhooks**

---

### Step 2: Add Webhook Endpoint

1. Click **"Add endpoint"** button
2. Enter your endpoint URL:

   **For Production:**
   ```
   https://yourdomain.com/api/stripe/webhook
   ```

   **For Replit:**
   ```
   https://smartflowsite.replit.app/api/stripe/webhook
   ```

   **For Local Testing (use Stripe CLI):**
   ```
   http://localhost:5000/api/stripe/webhook
   ```

3. **Description**: `SmartFlowSite Production Webhook`

---

### Step 3: Select Events to Listen For

Click **"Select events"** and choose these:

#### ✅ Required Events:

**Checkout Events:**
- [x] `checkout.session.completed` - Payment completed
- [x] `checkout.session.expired` - Checkout session expired

**Customer Events:**
- [x] `customer.created` - New customer created
- [x] `customer.updated` - Customer details updated
- [x] `customer.deleted` - Customer deleted

**Subscription Events:**
- [x] `customer.subscription.created` - New subscription started
- [x] `customer.subscription.updated` - Subscription changed
- [x] `customer.subscription.deleted` - Subscription canceled
- [x] `customer.subscription.trial_will_end` - Trial ending soon

**Payment Events:**
- [x] `invoice.payment_succeeded` - Payment successful
- [x] `invoice.payment_failed` - Payment failed
- [x] `invoice.created` - Invoice generated
- [x] `invoice.finalized` - Invoice finalized

**Payment Intent Events:**
- [x] `payment_intent.succeeded` - Payment successful
- [x] `payment_intent.payment_failed` - Payment failed
- [x] `payment_intent.canceled` - Payment canceled

---

### Step 4: Get Webhook Signing Secret

1. After creating the endpoint, you'll see your webhook details
2. Click **"Reveal"** next to **Signing secret**
3. Copy the secret (starts with `whsec_...`)
4. Add it to your `.env` file:

   ```bash
   # In /home/garet/SFS/SmartFlowSite/.env
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_SECRET_HERE
   ```

---

### Step 5: Test Webhook (Using Stripe CLI)

#### Install Stripe CLI (if not already installed):

**Linux/WSL:**
```bash
curl -s https://packages.stripe.com/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.com/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe
```

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

#### Login to Stripe:
```bash
stripe login
```

#### Forward Webhooks to Local Server:
```bash
# Start your server first
cd /home/garet/SFS/SmartFlowSite
npm start

# In another terminal, forward webhooks
stripe listen --forward-to localhost:5000/api/stripe/webhook
```

This will give you a **webhook signing secret** for local testing. Copy it and add to `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxx_FROM_STRIPE_CLI
```

---

### Step 6: Test End-to-End

#### Option A: Send Test Event via Stripe CLI
```bash
stripe trigger checkout.session.completed
```

Check your server logs - you should see:
```
✓ Checkout completed: cs_test_...
  Customer: test@example.com
  Plan: starter
  Amount: 49 GBP
```

#### Option B: Complete a Real Test Payment

1. Start your server:
   ```bash
   cd /home/garet/SFS/SmartFlowSite
   npm start
   ```

2. Create a checkout session (see test-payment script)

3. Complete the payment in Stripe Checkout

4. Check server logs for webhook events

---

## 🔍 Verifying Webhook Delivery

### In Stripe Dashboard:

1. Go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Click **"Events"** tab
4. You should see delivered events with green checkmarks ✅

### Common Statuses:

| Status | Meaning | Action |
|--------|---------|--------|
| ✅ Succeeded | Webhook delivered successfully | No action needed |
| ⚠️ Pending | Waiting for delivery | Wait a moment |
| ❌ Failed | Delivery failed | Check endpoint URL and server logs |

---

## 🐛 Troubleshooting

### Webhook Not Receiving Events

**Problem:** Server not receiving webhook calls

**Solutions:**
1. Verify endpoint URL is publicly accessible (use `curl` to test)
2. Check server is running and listening on correct port
3. Verify no firewall blocking incoming requests
4. Check Stripe Dashboard → Webhooks for error messages
5. Test with Stripe CLI: `stripe listen --forward-to localhost:5000/api/stripe/webhook`

---

### Signature Verification Failed

**Problem:** `Webhook signature verification failed` error

**Solutions:**
1. Check `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
2. Make sure you're using `express.raw({type: 'application/json'})` middleware
3. Don't parse webhook request body before signature verification
4. Check for extra spaces in `.env` file

---

### Events Not Processing

**Problem:** Webhook received but events not handled

**Solutions:**
1. Check server logs for error messages
2. Verify event types match your switch statement
3. Add logging to each case in webhook handler
4. Test individual event types with Stripe CLI:
   ```bash
   stripe trigger checkout.session.completed
   stripe trigger customer.subscription.created
   ```

---

## 📊 Monitoring Webhooks

### In Production:

1. **Check Daily:** Review webhook logs in Stripe Dashboard
2. **Set Up Alerts:** Configure email alerts for failed webhooks
3. **Monitor Response Times:** Ensure your server responds quickly (< 5 seconds)
4. **Retry Logic:** Stripe automatically retries failed webhooks

### Webhook Best Practices:

✅ **DO:**
- Respond quickly (within 5 seconds)
- Return HTTP 200 status code
- Process events asynchronously if needed
- Log all webhook events
- Verify webhook signatures
- Handle all event types gracefully

❌ **DON'T:**
- Perform long-running tasks in webhook handler
- Return errors for unhandled event types
- Skip signature verification
- Expose webhook errors to client
- Process same event multiple times (check for duplicates)

---

## 🔐 Security Considerations

### Always:
1. **Verify signatures** - Never skip `stripe.webhooks.constructEvent()`
2. **Use HTTPS** - Required for production webhooks
3. **Keep secrets secure** - Never commit webhook secret to git
4. **Validate data** - Don't trust webhook data blindly
5. **Rate limit** - Protect against webhook floods

---

## 📝 Event Handling Checklist

For each event, decide what to do:

### `checkout.session.completed`
- [ ] Save customer to database
- [ ] Create subscription record
- [ ] Send welcome email
- [ ] Provision user account
- [ ] Log successful payment

### `customer.subscription.created`
- [ ] Update user subscription status
- [ ] Enable premium features
- [ ] Send confirmation email

### `customer.subscription.updated`
- [ ] Update subscription tier in database
- [ ] Adjust user limits/features
- [ ] Log the change

### `customer.subscription.deleted`
- [ ] Disable premium features
- [ ] Update user status to "canceled"
- [ ] Send cancellation confirmation
- [ ] Schedule data retention

### `invoice.payment_succeeded`
- [ ] Log successful payment
- [ ] Update payment records
- [ ] Send receipt email (Stripe does this automatically)

### `invoice.payment_failed`
- [ ] Send payment failed notification
- [ ] Update user status
- [ ] Log failed payment attempt
- [ ] Trigger retry logic

---

## 🎯 Next Steps

After webhook setup is complete:

1. **Test thoroughly** with small payments
2. **Monitor logs** for first few days
3. **Set up alerts** for failed webhooks
4. **Document** your webhook handling logic
5. **Plan** for future events (refunds, disputes, etc.)

---

## 🔗 Resources

- **Stripe Webhooks Docs**: https://stripe.com/docs/webhooks
- **Stripe CLI Docs**: https://stripe.com/docs/stripe-cli
- **Event Types**: https://stripe.com/docs/api/events/types
- **Testing Webhooks**: https://stripe.com/docs/webhooks/test
- **Webhook Best Practices**: https://stripe.com/docs/webhooks/best-practices

---

## ✅ Webhook Setup Complete!

Your webhook endpoint: `https://yourdomain.com/api/stripe/webhook`

**Configured Events:** 15+ events
**Status:** Ready for production
**Next:** Test with real payment

---

**Last Updated:** 2025-12-18
**Mode:** LIVE (Production)
