import express from "express";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { sanitizeForLog } from "./server/utils/log-sanitizer.mjs";

const app = express();

// Security Middleware
app.use(helmet({
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
  },
  crossOriginEmbedderPolicy: false
}));

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

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load config once at startup
const config = JSON.parse(readFileSync("./public/site.config.json", "utf-8"));

// Ensure data directory exists
const dataDir = "./data";
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Leads database file path
const leadsFile = join(dataDir, "leads.json");

// Initialize leads file if it doesn't exist
if (!existsSync(leadsFile)) {
  writeFileSync(leadsFile, JSON.stringify({ leads: [] }, null, 2));
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

// API: Submit Lead
app.post("/api/leads", fileSystemLimiter, (req, res) => {
  try {
    const { firstName, lastName, email, company, phone, source } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, and email are required"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
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

// API: Stripe Checkout (placeholder - requires Stripe configuration)
app.post("/api/stripe/checkout", async (req, res) => {
  try {
    const { planId } = req.body;

    // Load pricing data
    const pricingData = JSON.parse(readFileSync("./public/pricing.json", "utf-8"));
    const plan = pricingData.plans.find(p => p.id === planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    // TODO: Implement Stripe checkout session
    // For now, return a placeholder response
    // You'll need to:
    // 1. Install stripe package: npm install stripe
    // 2. Add STRIPE_SECRET_KEY to .env
    // 3. Create Stripe checkout session

    console.log(`Checkout requested for plan: ${sanitizeForLog(planId)}`);

    // Placeholder response
    res.json({
      success: true,
      message: "Stripe integration pending",
      planId,
      plan: plan.name,
      price: plan.price,
      // In production, return: url: session.url
      url: `/contact.html?plan=${planId}` // Temporary redirect to contact
    });

  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create checkout session"
    });
  }
});

// port
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`serving on ${port}`));
export default app;