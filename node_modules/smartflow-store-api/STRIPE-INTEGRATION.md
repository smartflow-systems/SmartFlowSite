# Stripe Integration Guide - SmartFlow Systems Landing Page

## Overview
This guide explains how to integrate Stripe checkout for the landing page pricing plans.

## Current Status
- Landing page: `/public/landing.html` - ✅ Complete
- API endpoint: `POST /api/stripe/checkout` - ⚠️ Placeholder (needs Stripe SDK)
- Success page: `/public/success.html` - ✅ Complete

## Setup Instructions

### 1. Install Stripe SDK
```bash
npm install stripe
```

### 2. Add Environment Variables
Add to `.env` file:
```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

### 3. Create Stripe Products & Prices
In your Stripe Dashboard (https://dashboard.stripe.com):

#### Starter Plan
- Name: SmartFlow Starter
- Price: £199 (one-time)
- Product ID: Save this as `STRIPE_STARTER_PRICE_ID`

#### Pro Plan
- Name: SmartFlow Pro
- Price: £499 (one-time)
- Product ID: Save this as `STRIPE_PRO_PRICE_ID`

#### Premium Plan
- Name: SmartFlow Premium
- Price: £999 (one-time)
- Product ID: Save this as `STRIPE_PREMIUM_PRICE_ID`

Add these to `.env`:
```env
STRIPE_STARTER_PRICE_ID=price_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_PREMIUM_PRICE_ID=price_xxx
```

### 4. Update server.js

Replace the placeholder Stripe checkout endpoint with this code:

```javascript
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Price ID mapping
const pricingMap = {
  starter: process.env.STRIPE_STARTER_PRICE_ID,
  pro: process.env.STRIPE_PRO_PRICE_ID,
  premium: process.env.STRIPE_PREMIUM_PRICE_ID
};

// API: Stripe Checkout
app.post("/api/stripe/checkout", async (req, res) => {
  try {
    const { planId, successUrl, cancelUrl } = req.body;

    // Validate plan
    if (!pricingMap[planId]) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', // One-time payment
      payment_method_types: ['card'],
      line_items: [
        {
          price: pricingMap[planId],
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        planId: planId
      },
      allow_promotion_codes: true, // Enable discount codes
      billing_address_collection: 'required',
      customer_email: req.body.email || undefined, // Optional: pre-fill email
    });

    console.log(`✓ Checkout session created for plan: ${planId}`);

    res.json({
      success: true,
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error("Stripe checkout error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create checkout session",
      error: error.message
    });
  }
});

// Webhook to handle successful payments
app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Save order to database
    const order = {
      id: `order_${Date.now()}`,
      sessionId: session.id,
      planId: session.metadata.planId,
      customerEmail: session.customer_email,
      amount: session.amount_total,
      currency: session.currency,
      status: 'paid',
      createdAt: new Date().toISOString()
    };

    // TODO: Save order to database
    console.log('✓ Payment successful:', order);

    // TODO: Send confirmation email
    // TODO: Provision user account
  }

  res.json({received: true});
});
```

### 5. Configure Stripe Webhook
1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
4. Copy the webhook signing secret
5. Add to `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 6. Test the Integration

#### Test Mode
1. Use test API keys (starts with `sk_test_` and `pk_test_`)
2. Use Stripe test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

#### Testing Steps
1. Start the server: `npm start`
2. Visit: `http://localhost:5000/landing.html`
3. Click "Get Started" on any pricing plan
4. Should redirect to Stripe Checkout
5. Use test card number
6. Complete payment
7. Should redirect to success page

### 7. Go Live

#### Before Production:
- [ ] Switch to live API keys (starts with `sk_live_` and `pk_live_`)
- [ ] Create production Stripe products/prices
- [ ] Update webhook endpoint to production URL
- [ ] Test with real credit card (small amount)
- [ ] Set up customer email notifications
- [ ] Implement order fulfillment workflow
- [ ] Add analytics tracking
- [ ] Test refund process

#### Recommended Additions:
- Customer portal for managing subscriptions
- Email receipts (Stripe can handle this)
- Tax calculation (Stripe Tax)
- Fraud prevention (Stripe Radar)
- Invoice generation
- Order tracking dashboard

## API Endpoints

### POST /api/leads
Capture lead information from the contact form.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "company": "Acme Corp",
  "phone": "+44 1234 567890",
  "source": "landing_page"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Lead captured successfully",
  "leadId": "lead_1234567890_abc123"
}
```

### POST /api/stripe/checkout
Create Stripe checkout session for a pricing plan.

**Request:**
```json
{
  "planId": "pro",
  "successUrl": "https://yourdomain.com/success.html",
  "cancelUrl": "https://yourdomain.com/landing.html#pricing"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://checkout.stripe.com/pay/cs_test_xxx",
  "sessionId": "cs_test_xxx"
}
```

### GET /api/leads
Get all captured leads (admin endpoint).

**Response:**
```json
{
  "success": true,
  "count": 5,
  "leads": [
    {
      "id": "lead_1234567890_abc123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "company": "Acme Corp",
      "phone": "+44 1234 567890",
      "source": "landing_page",
      "status": "new",
      "createdAt": "2024-11-21T12:00:00.000Z"
    }
  ]
}
```

## Database Storage

### Leads Storage
- Location: `/data/leads.json`
- Format: JSON file with array of lead objects
- Automatically created on first lead submission

### Future: Migrate to Database
For production, consider migrating to:
- PostgreSQL with Prisma ORM
- MongoDB
- Supabase
- Firebase

## Security Considerations

1. **API Keys**: Never commit API keys to git
2. **Webhook Signature**: Always verify webhook signatures
3. **Input Validation**: Validate all user inputs
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **HTTPS Only**: Always use HTTPS in production
6. **CORS**: Configure CORS properly
7. **Authentication**: Add auth for admin endpoints

## Analytics & Tracking

Add conversion tracking to landing page:

```javascript
// Google Analytics
gtag('event', 'conversion', {
  'send_to': 'AW-CONVERSION_ID',
  'value': 499.0,
  'currency': 'GBP'
});

// Facebook Pixel
fbq('track', 'Purchase', {
  value: 499.0,
  currency: 'GBP'
});
```

## Support & Resources

- Stripe Documentation: https://stripe.com/docs
- Stripe Node.js SDK: https://github.com/stripe/stripe-node
- Test Cards: https://stripe.com/docs/testing
- Webhooks Guide: https://stripe.com/docs/webhooks

## Troubleshooting

### Common Issues

**"No such price" error**
- Verify price IDs in Stripe Dashboard
- Ensure using correct test/live mode
- Check environment variables are set

**Webhook not receiving events**
- Verify webhook URL is accessible
- Check webhook signing secret
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:5000/api/stripe/webhook`

**Checkout session not redirecting**
- Check success/cancel URLs are valid
- Ensure HTTPS in production
- Verify session creation response

## Next Steps

1. Complete Stripe integration following steps 1-4
2. Test thoroughly in test mode
3. Configure email notifications
4. Set up order fulfillment workflow
5. Add customer portal
6. Deploy to production
7. Switch to live keys
8. Monitor transactions in Stripe Dashboard
