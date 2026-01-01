# Stripe Setup Quickstart - SmartFlow Site

## ⚡ Get Your Stripe Keys in 5 Minutes

### Step 1: Create/Login to Stripe Account (2 minutes)

1. Go to **https://dashboard.stripe.com/**
2. Create account or login
3. **Make sure you're in TEST MODE** (toggle in top right corner - should say "Test mode")

---

### Step 2: Get Your API Keys (1 minute)

1. In Stripe Dashboard, click **Developers** in the left sidebar
2. Click **API keys**
3. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...` - click "Reveal test key")

4. Copy these and update your `.env` file:

```bash
# Replace the placeholder values in /home/garet/SFS/SmartFlowSite/.env

STRIPE_SECRET_KEY=sk_test_51ABC...YOUR_ACTUAL_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_51ABC...YOUR_ACTUAL_KEY_HERE
```

---

### Step 3: Create Stripe Products (Optional - can use setup script instead)

**Option A: Use Automated Script (Recommended)**
```bash
cd /home/garet/SFS
export STRIPE_SECRET_KEY="sk_test_YOUR_KEY_HERE"
node scripts/setup-stripe-products.js --test
```

**Option B: Manual Creation**
1. In Stripe Dashboard, go to **Products** → **Add Product**
2. Create three products:

#### Product 1: SmartFlow Starter
- Name: `SmartFlow Starter`
- Price: `199` GBP (one-time payment)
- Copy the **Price ID** (starts with `price_...`)

#### Product 2: SmartFlow Pro
- Name: `SmartFlow Pro`
- Price: `499` GBP (one-time payment)
- Copy the **Price ID**

#### Product 3: SmartFlow Premium
- Name: `SmartFlow Premium`
- Price: `999` GBP (one-time payment)
- Copy the **Price ID**

3. Add price IDs to `.env`:

```bash
STRIPE_STARTER_PRICE_ID=price_ABC123...
STRIPE_PRO_PRICE_ID=price_DEF456...
STRIPE_PREMIUM_PRICE_ID=price_GHI789...
```

---

### Step 4: Set Up Webhook (2 minutes)

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter endpoint URL:
   - **For local testing**: Use Stripe CLI (see below)
   - **For production**: `https://yourdomain.com/api/stripe/webhook`

4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_...`)
7. Add to `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_ABC123...
```

---

### Step 5: Test Locally with Stripe CLI (Optional but Recommended)

```bash
# Install Stripe CLI
# MacOS/Linux:
curl -s https://packages.stripe.com/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.com/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/stripe/webhook

# This will give you a webhook secret for testing - add it to .env
```

---

## 🧪 Quick Test

Once you've added your keys to `.env`:

```bash
cd /home/garet/SFS/SmartFlowSite

# Start the server
npm start

# In another terminal, test the checkout endpoint
curl -X POST http://localhost:5000/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "starter",
    "successUrl": "http://localhost:5000/success.html",
    "cancelUrl": "http://localhost:5000/pricing.html"
  }'
```

If configured correctly, you should get a response with a Stripe checkout URL:
```json
{
  "success": true,
  "url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "sessionId": "cs_test_..."
}
```

---

## 🎯 Test Card Numbers

Use these in Stripe Checkout (TEST MODE ONLY):

| Scenario | Card Number | Expiry | CVC | ZIP |
|----------|-------------|--------|-----|-----|
| ✅ Success | `4242 4242 4242 4242` | Any future date | Any 3 digits | Any 5 digits |
| ❌ Decline | `4000 0000 0000 0002` | Any future date | Any 3 digits | Any 5 digits |
| ⚠️ 3D Secure | `4000 0025 0000 3155` | Any future date | Any 3 digits | Any 5 digits |

---

## ✅ Verification Checklist

Before going live, verify:

- [ ] Stripe keys added to `.env` (TEST keys for development)
- [ ] All three products created in Stripe Dashboard
- [ ] Price IDs added to `.env`
- [ ] Webhook endpoint configured
- [ ] Webhook secret added to `.env`
- [ ] Server starts without errors (`npm start`)
- [ ] Checkout endpoint returns valid Stripe URL
- [ ] Test payment completes successfully
- [ ] Webhook receives payment confirmation

---

## 🚨 Important Security Notes

1. **NEVER commit `.env` to git** - it's already in `.gitignore`
2. **Use TEST keys for development** (`sk_test_...` and `pk_test_...`)
3. **Only use LIVE keys in production** (`sk_live_...` and `pk_live_...`)
4. **Keep your secret key SECRET** - never share it or expose it in frontend code
5. **Always verify webhook signatures** - the code already does this

---

## 📝 What's Next?

After setup is complete:

1. Update `server.js` with full Stripe implementation (see STRIPE-INTEGRATION.md)
2. Test the complete checkout flow
3. Configure email notifications
4. Add order fulfillment logic
5. Deploy to production
6. Switch to live keys when ready to accept real payments

---

## 💡 Helpful Resources

- **Stripe Dashboard**: https://dashboard.stripe.com/
- **API Keys**: https://dashboard.stripe.com/test/apikeys
- **Products**: https://dashboard.stripe.com/test/products
- **Webhooks**: https://dashboard.stripe.com/test/webhooks
- **Test Cards**: https://stripe.com/docs/testing
- **Stripe CLI**: https://stripe.com/docs/stripe-cli
- **Node.js Docs**: https://stripe.com/docs/api?lang=node

---

## 🐛 Troubleshooting

**"Invalid API Key"**
- Check you copied the full key (starts with `sk_test_`)
- Make sure no extra spaces in `.env`
- Verify you're in TEST mode in Stripe Dashboard

**"No such price"**
- Verify price IDs in Stripe Dashboard → Products
- Check you're using the price ID, not product ID
- Ensure test/live mode matches between keys and price IDs

**"Webhook signature verification failed"**
- Check webhook secret in `.env`
- For local testing, use Stripe CLI
- Verify endpoint URL is correct

**Server won't start**
- Run `npm install` to ensure all dependencies installed
- Check `.env` file format (no quotes around values)
- Look for syntax errors in server.js

---

**Need help?** Check the full guide: `STRIPE-INTEGRATION.md`
