# Revenue Tracker
# SmartFlow Systems — MRR, Pipeline, and Milestones
# Last updated: 2026-03-29

---

## Current Status

| Metric | Value |
|--------|-------|
| MRR | £0 |
| Customers | 0 |
| Months building | 6 |
| Revenue milestone gate | £1,000 MRR before new builds |

**Root cause:** Sales execution, not technical capability.
**Top priority:** Close first paying customer — barber or salon.

---

## Products & Pricing

### Barber-booker-v1 ⭐ #1 priority
| Plan | Price | Features |
|------|-------|---------|
| Starter | £29/month | Online booking, Google Cal sync, Stripe deposits |
| Pro | £97/month | + reminders, analytics |
| Agency | £297/month | White label, multi-location |

### SocialScaleBooster ⭐ #2 priority
| Plan | Price | Features |
|------|-------|---------|
| Starter | £29/month | 100 AI generations/month |
| Pro | £97/month | 1,000 AI generations/month |
| Agency | £297/month | Unlimited + white label |

### Bundle Deal
Both Barber Booker + SocialScaleBooster: **£49/month**
(£9 saving vs buying separately)

### Other Products (not actively selling yet)
| Product | Model | Planned Price |
|---------|-------|--------------|
| SocialScaleBoosterAIbot | Freemium | Free / Pro / Enterprise |
| sfs-marketing-and-growth | Subscription | Starter / Growth / Agency |
| sfs-white-label-dashboard | Multi-tenant | Per seat / Per tenant |
| AP-CRM | Subscription | £29+/month |

---

## Revenue Milestones

| Milestone | Target | Status |
|-----------|--------|--------|
| First customer | £29 MRR | ⏳ Not reached |
| Proof of concept | £500 MRR | ⏳ Not reached |
| Gate: resume building | £1,000 MRR | ⏳ Not reached |
| Sustainable | £5,000 MRR | ⏳ Not reached |
| Scale | £10,000 MRR | ⏳ Not reached |

---

## Sales Pipeline

| Lead | Product | Stage | Notes |
|------|---------|-------|-------|
| — | — | — | No leads yet |

Update this table as leads progress through:
`Prospect → Demo booked → Demo done → Trial → Paid`

---

## Stripe Setup

### Required Env Vars
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_STARTER=price_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_AGENCY=price_...
```

### Check Live MRR
```bash
# 🖥️ Replit Shell
node -e "
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
stripe.subscriptions.list({ status: 'active', limit: 100 }).then(({ data }) => {
  const mrr = data.reduce((total, sub) => {
    const amount = sub.items.data[0].price.unit_amount;
    const interval = sub.items.data[0].price.recurring.interval;
    return total + (interval === 'year' ? amount / 12 : amount);
  }, 0);
  console.log('MRR: £' + (mrr / 100).toFixed(2));
  console.log('Customers: ' + data.length);
});
"
```

### Check Active Subscriptions
```bash
stripe subscriptions list --status=active
```

---

## Churn Tracking

| Month | New | Churned | Net | MRR |
|-------|-----|---------|-----|-----|
| Mar 2026 | 0 | 0 | 0 | £0 |

---

## Sales Objection Responses

**"I already use Treatwell/Fresha"**
→ Those take commission per booking. This is flat monthly — you keep 100%.

**"I'm not tech savvy"**
→ We set it up for you. 30 minutes. You just share a link.

**"It's too expensive"**
→ One extra booking per week pays for it. Most see 3–5 extra bookings.

**"I'll think about it"**
→ I can get you live today. Want me to set up a demo right now?

---

## VERIFY
```bash
stripe subscriptions list --status=active --limit=5
stripe events list --limit=5
```

---

*revenue-tracker v1.0 — SmartFlow Systems*
*Last updated: 2026-03-29*
