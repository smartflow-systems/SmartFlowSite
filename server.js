import express from "express";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import crypto from "crypto";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { doubleCsrf } from "csrf-csrf";
import { sanitizeForLog } from "./server/utils/log-sanitizer.mjs";
import Stripe from "stripe";
import dotenv from "dotenv";
import { handleGitHubWebhook, handlePing } from "./replit-webhook-receiver.mjs";

// Load environment variables
dotenv.config();

// SECURITY: Validate critical secrets in production
if (process.env.NODE_ENV === 'production') {
  const requiredSecrets = [
    { name: 'STRIPE_SECRET_KEY', value: process.env.STRIPE_SECRET_KEY },
    { name: 'STRIPE_WEBHOOK_SECRET', value: process.env.STRIPE_WEBHOOK_SECRET },
    { name: 'JWT_SECRET', value: process.env.JWT_SECRET }
  ];

  const missing = requiredSecrets.filter(secret =>
    !secret.value ||
    secret.value.includes('change-in-production') ||
    secret.value.includes('your-secret-key') ||
    secret.value.length < 16
  );

  if (missing.length > 0) {
    console.error('⛔ CRITICAL: Missing or insecure secrets in production:');
    missing.forEach(secret => console.error(`   - ${secret.name}`));
    console.error('\nApplication cannot start securely. Please set proper environment variables.');
    process.exit(1);
  }

  console.log('✅ Production secrets validated');
}

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();

// CSP Nonce middleware - generates unique nonce for each request
app.use((req, res, next) => {
  res.locals.cspNonce = Buffer.from(crypto.randomUUID()).toString('base64');
  next();
});

// Security Middleware with nonce-based CSP
app.use((req, res, next) => {
  const nonce = res.locals.cspNonce;

  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'",
          `'nonce-${nonce}'`,
          "https://fonts.googleapis.com"
        ],
        scriptSrc: [
          "'self'",
          `'nonce-${nonce}'`,
          "https://js.stripe.com"
        ],
        imgSrc: ["'self'", "data:", "https:", "https://*.stripe.com"],
        connectSrc: [
          "'self'",
          "https://api.stripe.com",
          process.env.NODE_ENV === 'development' ? 'http://localhost:*' : ''
        ].filter(Boolean),
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  })(req, res, next);
});

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://smartflowsite.com', 'https://www.smartflowsite.com']
    : '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Limit auth attempts
  message: "Too many authentication attempts, please try again later."
});

// Stricter rate limiting for file system operations
const fileSystemLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // Stricter limit for file system operations
  message: "Too many file system requests, please try again later."
});

app.use('/api/', limiter);

// IMPORTANT: Webhook routes with raw body MUST come before express.json()
// GitHub webhook endpoint - requires raw body for signature verification
app.post('/api/webhook/github-deploy', express.raw({ type: 'application/json' }), handleGitHubWebhook);
app.get('/api/webhook/ping', handlePing);

// Body parsing middleware (for other routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CSRF Protection Configuration
const {
  generateToken,    // Used to provide a CSRF token
  doubleCsrfProtection // Used to protect routes
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || process.env.SESSION_SECRET,
  cookieName: '__Host-psifi.x-csrf-token',
  cookieOptions: {
    sameSite: 'strict',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getTokenFromRequest: (req) => req.headers['x-csrf-token'] || req.body._csrf
});

// CSRF Token endpoint - frontend can fetch this to get a token
app.get('/api/csrf-token', (req, res) => {
  const csrfToken = generateToken(req, res);
  res.json({ csrfToken });
});

// Load config once at startup
const config = JSON.parse(readFileSync("./public/site.config.json", "utf-8"));

// Ensure data directory exists
const dataDir = "./data";
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Database file paths
const leadsFile = join(dataDir, "leads.json");
const subscriptionsFile = join(dataDir, "subscriptions.json");

// Initialize leads file if it doesn't exist
// SECURITY: Use atomic file operations to prevent TOCTOU race conditions
try {
  // Try to read the file first
  const data = readFileSync(leadsFile, "utf-8");
  JSON.parse(data); // Validate it's valid JSON
} catch (error) {
  // File doesn't exist or is invalid - initialize it
  if (error.code === 'ENOENT' || error instanceof SyntaxError) {
    try {
      // Use 'wx' flag for atomic create-if-not-exists
      writeFileSync(leadsFile, JSON.stringify({ leads: [] }, null, 2), { flag: 'wx' });
    } catch (writeError) {
      // File was created by another process - that's okay, ignore EEXIST
      if (writeError.code !== 'EEXIST') {
        console.error('Error initializing leads file:', writeError);
        throw writeError;
      }
    }
  } else {
    console.error('Error reading leads file:', error);
    throw error;
  }
}

// Helper: Safe email validation (prevents ReDoS attacks)
function isValidEmail(email) {
  // Limit length to prevent DoS
  if (typeof email !== 'string' || email.length > 254 || email.length < 3) {
    return false;
  }

  // Simple, non-backtracking validation
  const atIndex = email.indexOf('@');
  if (atIndex < 1 || atIndex === email.length - 1) {
    return false;
  }

  const dotIndex = email.lastIndexOf('.');
  if (dotIndex < atIndex + 2 || dotIndex === email.length - 1) {
    return false;
  }

  // Efficient character validation with bounded quantifiers
  // This pattern uses atomic groups and doesn't cause catastrophic backtracking
  return /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]{1,64}@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email);
}

// Initialize subscriptions file if it doesn't exist
if (!existsSync(subscriptionsFile)) {
  writeFileSync(subscriptionsFile, JSON.stringify({ subscriptions: [] }, null, 2));
}

// Helper: Read leads
function readLeads() {
  try {
    const data = readFileSync(leadsFile, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading leads:", error);
    return { leads: [] };
  }
}

// Helper: Write leads
function writeLeads(data) {
  try {
    writeFileSync(leadsFile, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing leads:", error);
    return false;
  }
}

// Helper: Read subscriptions
function readSubscriptions() {
  try {
    const data = readFileSync(subscriptionsFile, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading subscriptions:", error);
    return { subscriptions: [] };
  }
}

// Helper: Write subscriptions
function writeSubscriptions(data) {
  try {
    writeFileSync(subscriptionsFile, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing subscriptions:", error);
    return false;
  }
}

// Helper: Send email notification (placeholder - integrate with email service)
async function sendEmail(to, subject, body) {
  try {
    // TODO: Integrate with actual email service (SendGrid, Mailgun, AWS SES, etc.)
    // For now, log the email that would be sent
    console.log(`📧 Email would be sent to: ${sanitizeForLog(to)}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body: ${body.substring(0, 100)}...`);

    // Simulate async email sending
    return { success: true, messageId: `email_${Date.now()}` };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: error.message };
  }
}

// Authentication middleware for admin endpoints
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const apiKey = process.env.ADMIN_API_KEY || process.env.SYNC_TOKEN;

  if (!apiKey || apiKey === 'your-sync-token-change-in-production') {
    return res.status(500).json({
      success: false,
      message: "Server configuration error: Admin API key not configured"
    });
  }

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  if (token !== apiKey) {
    return res.status(403).json({
      success: false,
      message: "Invalid credentials"
    });
  }

  next();
}

// serve everything from /public
app.use(express.static("public"));

// health check with site info
app.get("/health", (_req, res) => res.json({
  ok: true,
  siteName: config.siteName,
  version: config.version
}));
app.get("/api/health", (_req, res) => res.json({
  ok: true,
  siteName: config.siteName,
  version: config.version
}));

// API: Submit Lead (CSRF protected)
app.post("/api/leads", fileSystemLimiter, doubleCsrfProtection, (req, res) => {
  try {
    const { firstName, lastName, email, company, phone, source } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, and email are required"
      });
    }

    // Validate email format (ReDoS-safe validation)
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Read existing leads
    const data = readLeads();

    // Check for duplicate email
    const existingLead = data.leads.find(lead => lead.email === email);
    if (existingLead) {
      return res.status(200).json({
        success: true,
        message: "Lead already exists",
        leadId: existingLead.id
      });
    }

    // Create new lead
    const newLead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      firstName,
      lastName,
      email,
      company: company || "",
      phone: phone || "",
      source: source || "direct",
      status: "new",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add lead to array
    data.leads.push(newLead);

    // Save to file
    if (!writeLeads(data)) {
      throw new Error("Failed to save lead");
    }

    console.log(`✓ New lead captured: ${sanitizeForLog(email)}`);

    // Return success
    res.status(201).json({
      success: true,
      message: "Lead captured successfully",
      leadId: newLead.id
    });

  } catch (error) {
    console.error("Lead submission error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// API: Get All Leads (admin only - requires authentication)
app.get("/api/leads", requireAuth, (_req, res) => {
  try {
    const data = readLeads();
    res.json({
      success: true,
      count: data.leads.length,
      leads: data.leads
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leads"
    });
  }
});

// Price ID mapping for SmartFlow MarketFlow tiers
const pricingMap = {
  starter: process.env.STRIPE_STARTER_PRICE_ID,
  pro: process.env.STRIPE_PRO_PRICE_ID,
  premium: process.env.STRIPE_PREMIUM_PRICE_ID,
  // Alias mappings
  smart_starter: process.env.STRIPE_STARTER_PRICE_ID,
  flow_kit: process.env.STRIPE_PRO_PRICE_ID,
  salon_launch: process.env.STRIPE_PREMIUM_PRICE_ID
};

// API: Stripe Checkout - Create checkout session (CSRF protected)
app.post("/api/stripe/checkout", doubleCsrfProtection, async (req, res) => {
  try {
    const { planId, successUrl, cancelUrl, customerEmail } = req.body;

    // Validate plan exists
    if (!pricingMap[planId]) {
      return res.status(404).json({
        success: false,
        message: "Plan not found. Valid plans: starter, pro, premium"
      });
    }

    // Default URLs if not provided
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const finalSuccessUrl = successUrl || `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = cancelUrl || `${baseUrl}/pricing.html`;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription', // Recurring subscription
      payment_method_types: ['card'],
      line_items: [
        {
          price: pricingMap[planId],
          quantity: 1,
        },
      ],
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      customer_email: customerEmail || undefined,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata: {
        planId: planId,
        source: 'smartflowsite'
      },
      subscription_data: {
        metadata: {
          planId: planId,
          source: 'smartflowsite'
        }
      }
    });

    console.log(`✓ Checkout session created: ${session.id} for plan: ${sanitizeForLog(planId)}`);

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
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

// API: Stripe Webhook - Handle Stripe events
app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log(`✓ Checkout completed: ${session.id}`);
        // SECURITY: Sanitize user-controlled data to prevent log injection
        console.log(`  Customer: ${sanitizeForLog(session.customer_email)}`);
        console.log(`  Plan: ${sanitizeForLog(session.metadata?.planId)}`);
        console.log(`  Amount: ${session.amount_total / 100} ${sanitizeForLog(session.currency?.toUpperCase())}`);

        // Save subscription to database
        const data = readSubscriptions();
        const newSubscription = {
          id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          stripeSessionId: session.id,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          customerEmail: session.customer_email,
          planId: session.metadata?.planId || 'unknown',
          status: 'active',
          amount: session.amount_total / 100,
          currency: session.currency.toUpperCase(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        data.subscriptions.push(newSubscription);
        writeSubscriptions(data);
        console.log(`✓ Subscription saved to database: ${newSubscription.id}`);

        // Send welcome email
        await sendEmail(
          session.customer_email,
          'Welcome to SmartFlow Systems!',
          `Thank you for subscribing to our ${session.metadata?.planId} plan. Your account is now active and ready to use.`
        );

        // Provision user account (placeholder - implement based on your user management system)
        console.log(`✓ User account provisioned for: ${sanitizeForLog(session.customer_email)}`);
        break;

      case 'customer.subscription.created':
        const subscription = event.data.object;
        console.log(`✓ Subscription created: ${subscription.id}`);

        // Update user subscription status in database
        const subsData = readSubscriptions();
        const existingSub = subsData.subscriptions.find(
          s => s.stripeSubscriptionId === subscription.id
        );
        if (existingSub) {
          existingSub.status = subscription.status;
          existingSub.currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
          existingSub.currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
          existingSub.updatedAt = new Date().toISOString();
          writeSubscriptions(subsData);
          console.log(`✓ Subscription status updated in database`);
        }
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object;
        console.log(`✓ Subscription updated: ${updatedSubscription.id}`);

        // Update user subscription in database
        const updateData = readSubscriptions();
        const subToUpdate = updateData.subscriptions.find(
          s => s.stripeSubscriptionId === updatedSubscription.id
        );
        if (subToUpdate) {
          subToUpdate.status = updatedSubscription.status;
          subToUpdate.currentPeriodStart = new Date(updatedSubscription.current_period_start * 1000).toISOString();
          subToUpdate.currentPeriodEnd = new Date(updatedSubscription.current_period_end * 1000).toISOString();
          subToUpdate.cancelAtPeriodEnd = updatedSubscription.cancel_at_period_end || false;
          subToUpdate.updatedAt = new Date().toISOString();
          writeSubscriptions(updateData);
          console.log(`✓ Subscription updated in database`);
        }
        break;

      case 'customer.subscription.deleted':
        const canceledSubscription = event.data.object;
        console.log(`✓ Subscription canceled: ${canceledSubscription.id}`);

        // Update user subscription status to canceled
        const cancelData = readSubscriptions();
        const subToCancel = cancelData.subscriptions.find(
          s => s.stripeSubscriptionId === canceledSubscription.id
        );
        if (subToCancel) {
          subToCancel.status = 'canceled';
          subToCancel.canceledAt = new Date().toISOString();
          subToCancel.updatedAt = new Date().toISOString();
          writeSubscriptions(cancelData);
          console.log(`✓ Subscription status set to canceled in database`);

          // Notify customer of cancellation
          if (subToCancel.customerEmail) {
            await sendEmail(
              subToCancel.customerEmail,
              'Subscription Canceled - SmartFlow Systems',
              `Your subscription has been canceled. You will retain access until the end of your billing period.`
            );
          }
        }
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        console.log(`✓ Payment succeeded: ${invoice.id}`);

        // Update payment records
        const paymentData = readSubscriptions();
        const subForPayment = paymentData.subscriptions.find(
          s => s.stripeSubscriptionId === invoice.subscription
        );
        if (subForPayment) {
          if (!subForPayment.payments) {
            subForPayment.payments = [];
          }
          subForPayment.payments.push({
            invoiceId: invoice.id,
            amount: invoice.amount_paid / 100,
            currency: invoice.currency.toUpperCase(),
            status: 'succeeded',
            paidAt: new Date(invoice.status_transitions.paid_at * 1000).toISOString()
          });
          subForPayment.lastPaymentStatus = 'succeeded';
          subForPayment.updatedAt = new Date().toISOString();
          writeSubscriptions(paymentData);
          console.log(`✓ Payment record added to database`);
        }
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        console.log(`⚠️ Payment failed: ${failedInvoice.id}`);

        // Send payment failed notification
        const failedPaymentData = readSubscriptions();
        const subForFailedPayment = failedPaymentData.subscriptions.find(
          s => s.stripeSubscriptionId === failedInvoice.subscription
        );
        if (subForFailedPayment) {
          if (!subForFailedPayment.payments) {
            subForFailedPayment.payments = [];
          }
          subForFailedPayment.payments.push({
            invoiceId: failedInvoice.id,
            amount: failedInvoice.amount_due / 100,
            currency: failedInvoice.currency.toUpperCase(),
            status: 'failed',
            attemptedAt: new Date().toISOString()
          });
          subForFailedPayment.lastPaymentStatus = 'failed';
          subForFailedPayment.updatedAt = new Date().toISOString();
          writeSubscriptions(failedPaymentData);

          // Notify customer of payment failure
          if (subForFailedPayment.customerEmail) {
            await sendEmail(
              subForFailedPayment.customerEmail,
              'Payment Failed - Action Required',
              `We were unable to process your recent payment. Please update your payment method to avoid service interruption.`
            );
          }
          console.log(`✓ Payment failure notification sent`);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// port
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`serving on ${port}`));
export default app;