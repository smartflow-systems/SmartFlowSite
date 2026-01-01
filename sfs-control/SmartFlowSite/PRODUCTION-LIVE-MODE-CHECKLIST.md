# 🔴 PRODUCTION LIVE MODE - CRITICAL CHECKLIST

**STATUS: LIVE STRIPE KEYS ACTIVE**
**DATE: 2025-12-18**

⚠️ **WARNING: You are now using LIVE Stripe keys. All transactions will charge REAL MONEY!**

---

## 🔴 CRITICAL: What LIVE Mode Means

| Aspect | Impact |
|--------|--------|
| **Payments** | ✅ Real credit cards charged |
| **Money** | ✅ Goes to your bank account |
| **Refunds** | ✅ Must be processed manually |
| **Test Cards** | ❌ Will NOT work (4242 4242...) |
| **Customers** | ✅ Receive real receipts |
| **Disputes** | ✅ Can happen for real |

---

## ✅ PRE-LAUNCH CHECKLIST

### 1. Stripe Account Configuration

- [ ] **Bank account connected** to receive payouts
- [ ] **Business details** completed in Stripe Dashboard
- [ ] **Email notifications** configured
- [ ] **Branding** set up (logo, colors)
- [ ] **Receipt emails** enabled
- [ ] **Customer portal** enabled (for subscriptions)
- [ ] **Tax settings** configured if applicable
- [ ] **Radar rules** reviewed (fraud prevention)

### 2. Products & Pricing

- [ ] **Live products created** in Stripe Dashboard
- [ ] **Correct prices** set (GBP/USD/EUR)
- [ ] **Price IDs** added to `.env` file
- [ ] **Product descriptions** clear and accurate
- [ ] **Billing intervals** correct (one-time/recurring)
- [ ] **Trial periods** configured if applicable

### 3. Webhooks

- [ ] **Live webhook endpoint** created in Stripe
- [ ] **Production URL** configured (https://yourdomain.com/api/stripe/webhook)
- [ ] **All required events** selected:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- [ ] **Webhook secret** added to `.env`
- [ ] **Webhook endpoint** responding (test with Stripe CLI)

### 4. Security

- [ ] **HTTPS enabled** on production domain (REQUIRED)
- [ ] **Strong ADMIN_API_KEY** set in `.env`
- [ ] **Strong JWT_SECRET** set in `.env`
- [ ] **Rate limiting** enabled and tested
- [ ] **CORS** configured correctly
- [ ] **CSP headers** configured
- [ ] **`.env` file** NOT committed to git (check `.gitignore`)
- [ ] **Environment variables** set in production hosting

### 5. Legal & Compliance

- [ ] **Terms of Service** published
- [ ] **Privacy Policy** published
- [ ] **Refund Policy** documented
- [ ] **GDPR compliance** if serving EU customers
- [ ] **Cookie consent** banner if required
- [ ] **Data processing agreement** with Stripe

### 6. Testing (CRITICAL!)

- [ ] **Small test payment** completed ($1 or £1)
- [ ] **Payment confirmed** in Stripe Dashboard
- [ ] **Webhook received** and processed
- [ ] **Customer receives** confirmation email
- [ ] **Refund process** tested
- [ ] **Error handling** tested (declined cards, etc.)
- [ ] **All pricing tiers** tested
- [ ] **Checkout flow** works on mobile
- [ ] **Success/Cancel pages** working correctly

### 7. Monitoring & Alerts

- [ ] **Stripe email notifications** enabled
- [ ] **Failed payment alerts** configured
- [ ] **Dispute alerts** configured
- [ ] **Analytics tracking** set up (Google Analytics, etc.)
- [ ] **Error logging** configured (Sentry, etc.)
- [ ] **Server monitoring** enabled (uptime checks)

### 8. Customer Support

- [ ] **Support email** configured
- [ ] **Refund process** documented
- [ ] **FAQ** created for common issues
- [ ] **Contact page** working
- [ ] **Response time** commitment defined

---

## 🚨 BEFORE ACCEPTING YOUR FIRST REAL PAYMENT

### Final Verification Steps:

1. **Test with a real card (small amount)**
   ```bash
   # Make a £1 test purchase with your own card
   # Then immediately refund it in Stripe Dashboard
   ```

2. **Verify webhook is working**
   ```bash
   # Check server logs after test payment
   # Confirm webhook event was received
   ```

3. **Check Stripe Dashboard**
   - Go to: https://dashboard.stripe.com/
   - Toggle to **"Live mode"** (NOT test mode)
   - Verify payment appears
   - Check customer details

4. **Verify email receipt**
   - Check you received Stripe's receipt email
   - Check customer receives receipt

5. **Test refund process**
   - Process a refund for the test payment
   - Verify refund appears in Dashboard
   - Check refund email received

---

## 💳 LIVE Payment Flow

### What Happens When Customer Pays:

1. Customer clicks "Buy Now" on your site
2. Redirected to Stripe Checkout (secure, PCI compliant)
3. Customer enters **REAL credit card**
4. Stripe processes **REAL payment**
5. Money goes to **YOUR Stripe account**
6. Webhook notifies your server
7. Customer redirected to success page
8. Customer receives receipt email
9. You receive notification email

### Important Notes:

- ⚠️ **Test cards WILL NOT WORK** (e.g., 4242 4242 4242 4242)
- ✅ **Only real credit/debit cards** will work
- ✅ **Customers will be charged real money**
- ✅ **You'll receive real money in your bank account**

---

## 🔄 Payouts

Stripe will automatically transfer funds to your bank account:

- **Default schedule**: Daily (after 7-day rolling basis for new accounts)
- **First payout**: 7-14 days after first payment
- **Ongoing payouts**: Daily automatic transfers
- **Payout minimum**: £1 (or equivalent)

Check payout schedule: https://dashboard.stripe.com/settings/payouts

---

## 🛑 Emergency Procedures

### If You Need to Stop Accepting Payments:

1. **Disable checkout endpoint** in server.js:
   ```javascript
   app.post("/api/stripe/checkout", (req, res) => {
     res.status(503).json({ error: "Payment system temporarily disabled" });
   });
   ```

2. **Remove pricing page** or add maintenance notice

3. **Contact Stripe support** if needed: https://support.stripe.com/

### If You Receive a Dispute/Chargeback:

1. **Check email** from Stripe
2. **Log into Dashboard** → Disputes
3. **Respond within deadline** (typically 7 days)
4. **Provide evidence** (receipts, delivery proof, etc.)
5. **Contact Stripe** support if unsure

### If You Need to Issue Refunds:

1. **Stripe Dashboard** → Payments
2. **Find the payment**
3. **Click "Refund"**
4. **Enter amount** (full or partial)
5. **Add reason** (optional but recommended)
6. **Confirm refund**
7. **Customer receives** refund in 5-10 business days

---

## 📊 Monitoring Your Business

### Daily Checks:

- [ ] Check Stripe Dashboard for new payments
- [ ] Review failed payments
- [ ] Monitor webhook delivery
- [ ] Check for disputes

### Weekly Checks:

- [ ] Review payout schedule
- [ ] Analyze conversion rates
- [ ] Check for fraud patterns
- [ ] Review customer feedback

### Monthly Checks:

- [ ] Reconcile with accounting
- [ ] Review churn rates (for subscriptions)
- [ ] Analyze pricing performance
- [ ] Update products if needed

---

## 🔒 Security Best Practices

### DO:
✅ Use HTTPS everywhere (REQUIRED)
✅ Verify webhook signatures
✅ Store customer data securely
✅ Use strong authentication
✅ Keep Stripe.js up to date
✅ Monitor for unusual activity
✅ Use Stripe Radar for fraud detection

### DON'T:
❌ Store raw credit card numbers (let Stripe handle it)
❌ Log sensitive data (card numbers, CVV, etc.)
❌ Share your secret API key
❌ Disable webhook signature verification
❌ Trust client-side data
❌ Ignore Stripe security alerts

---

## 📞 Support & Resources

### Stripe Support:
- **Dashboard**: https://dashboard.stripe.com/
- **Support**: https://support.stripe.com/
- **Docs**: https://stripe.com/docs
- **Status**: https://status.stripe.com/

### Your Setup:
- **Live Dashboard**: https://dashboard.stripe.com/ (toggle "Live mode")
- **Payments**: https://dashboard.stripe.com/payments
- **Customers**: https://dashboard.stripe.com/customers
- **Webhooks**: https://dashboard.stripe.com/webhooks
- **Payouts**: https://dashboard.stripe.com/payouts

---

## 🎯 Next Steps

1. **Create LIVE products** in Stripe Dashboard
2. **Get price IDs** and add to `.env`
3. **Set up webhook** endpoint
4. **Test with small payment** (£1)
5. **Verify everything works**
6. **Launch** when ready!

---

## ⚠️ FINAL REMINDER

**You are now in LIVE MODE. Every transaction is REAL.**

- Test carefully with small amounts first
- Have your refund process ready
- Monitor Stripe Dashboard closely
- Respond to disputes promptly
- Keep your API keys secure

**Good luck with your launch! 🚀**

---

**Last Updated**: 2025-12-18
**Environment**: PRODUCTION (LIVE)
**Stripe Mode**: LIVE KEYS ACTIVE
