import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import Stripe from "stripe";
import OpenAI from "openai";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { TwitterApi } from "twitter-api-v2";
import { AnalyticsWebSocketServer } from "./websocket";
import { storage } from "./storage";
import { insertBotSchema, insertBotTemplateSchema, insertAnalyticsSchema, insertUserSchema } from "@shared/schema";

// ── Token encryption helpers (aes-256-gcm) ────────────────────────────────────
// Stored format: iv_hex:tag_hex:cipher_hex

function getEncKey(): Buffer {
  const raw = process.env.TOKEN_ENCRYPTION_KEY;
  if (!raw || raw.length < 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY must be at least 32 characters");
  }
  return Buffer.from(raw.slice(0, 32), "utf8");
}

function encryptToken(plain: string): string {
  const key = getEncKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv.toString("hex"), cipher.getAuthTag().toString("hex"), enc.toString("hex")].join(":");
}

function decryptToken(stored: string): string {
  const key = getEncKey();
  const [ivHex, tagHex, encHex] = stored.split(":");
  if (!ivHex || !tagHex || !encHex) throw new Error("Malformed encrypted token");
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(encHex, "hex")), decipher.final()]).toString("utf8");
}

// Initialize Stripe
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const JWT_EXPIRY = "7d";

// ── Auth middleware ──────────────────────────────────────────────────────────

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { userId: number };
    (req as any).user = { id: payload.userId };
    next();
  } catch {
    res.status(401).json({ message: "Token expired or invalid" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {

  // ── Health ─────────────────────────────────────────────────────────────────

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    });
  });

  // ── Auth ───────────────────────────────────────────────────────────────────

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, email } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "username and password required" });
      }

      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(409).json({ message: "Username already taken" });
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = await storage.createUser(
        insertUserSchema.parse({ username, password: hashed, email })
      );

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
      res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email, isPremium: user.isPremium } });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
      res.json({ token, user: { id: user.id, username: user.username, email: user.email, isPremium: user.isPremium } });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser((req as any).user.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ id: user.id, username: user.username, email: user.email, isPremium: user.isPremium, botCount: user.botCount });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ── Bots ───────────────────────────────────────────────────────────────────

  app.get("/api/bots", requireAuth, async (req, res) => {
    try {
      const bots = await storage.getBotsByUserId((req as any).user.id);
      res.json(bots);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/bots/:id/stats", requireAuth, async (req, res) => {
    try {
      const botId = parseInt(req.params.id);
      const bot = await storage.getBot(botId);
      if (!bot) return res.status(404).json({ error: "Bot not found" });

      const createdDate = bot.createdAt ? new Date(bot.createdAt) : new Date();
      const daysSinceCreated = Math.max(1, Math.floor((Date.now() - createdDate.getTime()) / 86400000));
      const isActive = bot.status === "active";

      res.json({
        botId,
        name: bot.name,
        platform: bot.platform,
        status: bot.status,
        createdAt: bot.createdAt,
        totalPosts: isActive ? Math.floor(daysSinceCreated * (Math.random() * 3 + 1)) : 0,
        totalEngagement: isActive ? Math.floor(Math.random() * 5000) + 1000 : 0,
        totalReach: isActive ? Math.floor(Math.random() * 50000) + 10000 : 0,
        conversionRate: isActive ? (Math.random() * 5 + 2).toFixed(1) : "0.0",
        revenue: isActive ? (Math.random() * 1000 + 200).toFixed(2) : "0.00",
        impressions: isActive ? Math.floor(Math.random() * 100000) + 20000 : 0,
        clicks: isActive ? Math.floor(Math.random() * 2000) + 500 : 0,
        weeklyData: Array.from({ length: 7 }, (_, i) => ({
          day: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],
          posts: isActive ? Math.floor(Math.random() * 5) + 1 : 0,
          engagement: isActive ? Math.floor(Math.random() * 200) + 50 : 0,
          revenue: isActive ? (Math.random() * 50 + 10).toFixed(2) : "0.00",
        })),
        topPosts: isActive ? [
          { content: "🔥 Product showcase with amazing results!", engagement: Math.floor(Math.random() * 500) + 100, revenue: (Math.random() * 100 + 20).toFixed(2) },
          { content: "⚡ Flash sale announcement - 50% off!", engagement: Math.floor(Math.random() * 400) + 80, revenue: (Math.random() * 80 + 15).toFixed(2) },
          { content: "⭐ Customer testimonial showcase", engagement: Math.floor(Math.random() * 300) + 60, revenue: (Math.random() * 60 + 10).toFixed(2) },
        ] : [],
        platformMetrics: {
          followers: isActive ? Math.floor(Math.random() * 10000) + 1000 : 0,
          following: isActive ? Math.floor(Math.random() * 500) + 100 : 0,
          avgEngagementRate: isActive ? (Math.random() * 10 + 2).toFixed(1) + "%" : "0%",
        },
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/bots", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);

      if (!user?.isPremium && (user?.botCount || 0) >= 3) {
        return res.status(403).json({ message: "Free plan limited to 3 bots. Upgrade to Pro for unlimited bots." });
      }

      const botData = insertBotSchema.parse({ ...req.body, userId });
      const bot = await storage.createBot(botData);
      await storage.incrementUserBotCount(userId);
      res.json(bot);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.put("/api/bots/:id", requireAuth, async (req, res) => {
    try {
      const bot = await storage.updateBot(parseInt(req.params.id), req.body);
      res.json(bot);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/bots/:id", requireAuth, async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || !["active","paused","stopped"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const bot = await storage.updateBotStatus(parseInt(req.params.id), status);
      res.json(bot);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/bots/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bot = await storage.getBot(id);
      if (bot) {
        await storage.deleteBot(id);
        await storage.decrementUserBotCount(bot.userId);
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // ── Twitter / X — OAuth 2.0 PKCE integration ─────────────────────────────
  //
  // Test checklist:
  //   connect          GET  /api/integrations/twitter/auth-url?botId=N  → returns { url }
  //   callback         GET  /api/integrations/twitter/callback           → X redirects here, saves encrypted tokens, redirects to /?twitter_connected=1&botId=N
  //   status           GET  /api/bots/:id/twitter/status                 → { connected, twitterUsername, twitterUserId, expiresAt, lastPostAt, lastPostText, lastPostId, lastError }
  //   post             POST /api/bots/:id/post                           → { tweetId, text, tweetUrl }
  //   refresh expired  (automatic inside post route when expiresAt < now+5m)
  //   disconnect       POST /api/bots/:id/disconnect/twitter             → revokes tokens then clears bot.config.twitter
  //   reconnect        repeat connect flow — overwrites existing twitter config

  function getXOAuth2Client() {
    const clientId = process.env.X_CLIENT_ID;
    const clientSecret = process.env.X_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error("X_CLIENT_ID and X_CLIENT_SECRET env vars are not set");
    }
    return new TwitterApi({ clientId, clientSecret });
  }

  // Decrypt stored tokens and return a ready-to-use client, refreshing if within 5 min of expiry.
  // Returns updated encrypted tokens if a refresh happened (caller must persist).
  async function getRefreshedClient(tw: Record<string, any>): Promise<{
    client: InstanceType<typeof TwitterApi>;
    updatedTokens: Record<string, any> | null;
  }> {
    const accessToken = decryptToken(tw.accessToken as string);
    const refreshToken = tw.refreshToken ? decryptToken(tw.refreshToken as string) : null;
    const fiveMinFromNow = Date.now() + 5 * 60 * 1000;

    if (tw.expiresAt && tw.expiresAt < fiveMinFromNow && refreshToken) {
      const appClient = getXOAuth2Client();
      const refreshed = await appClient.refreshOAuth2Token(refreshToken);
      const newRefreshToken = refreshed.refreshToken ?? refreshToken;
      return {
        client: refreshed.client,
        updatedTokens: {
          accessToken: encryptToken(refreshed.accessToken),
          refreshToken: encryptToken(newRefreshToken),
          expiresAt: Date.now() + (refreshed.expiresIn ?? 7200) * 1000,
        },
      };
    }

    return { client: new TwitterApi(accessToken), updatedTokens: null };
  }

  // Step 1: Generate PKCE auth URL and persist state to DB
  app.get("/api/integrations/twitter/auth-url", requireAuth, async (req, res) => {
    try {
      const botId = parseInt(req.query.botId as string);
      if (!botId || isNaN(botId)) {
        return res.status(400).json({ message: "botId query param required" });
      }
      const userId = (req as any).user.id;
      const bot = await storage.getBot(botId);
      if (!bot || bot.userId !== userId) {
        return res.status(404).json({ message: "Bot not found" });
      }

      const callbackUrl = process.env.X_CALLBACK_URL;
      if (!callbackUrl) {
        return res.status(500).json({ message: "X_CALLBACK_URL env var is not set" });
      }

      const client = getXOAuth2Client();
      const { url, state, codeVerifier } = client.generateOAuth2AuthLink(callbackUrl, {
        scope: ["tweet.read", "tweet.write", "users.read", "offline.access"],
      });

      await storage.createOAuthSession({
        state,
        codeVerifier,
        botId,
        userId,
        provider: "twitter",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      });

      // Best-effort prune of stale rows
      storage.deleteExpiredOAuthSessions().catch(() => undefined);

      res.json({ url });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Step 2: X redirects back with ?state=&code= (or ?error=)
  app.get("/api/integrations/twitter/callback", async (req, res) => {
    const redirectError = (msg: string) =>
      res.redirect(`/?twitter_error=${encodeURIComponent(msg)}`);

    try {
      const { state, code, error: oauthError } = req.query as Record<string, string>;

      if (oauthError) {
        return redirectError(oauthError);
      }
      if (!state || !code) {
        return redirectError("Missing state or code in callback");
      }

      const session = await storage.getAndDeleteOAuthSession(state);
      if (!session) {
        return redirectError("Invalid or expired OAuth state — please try again");
      }
      if (session.expiresAt < new Date()) {
        return redirectError("OAuth session expired — please try again");
      }

      const callbackUrl = process.env.X_CALLBACK_URL!;
      const appClient = getXOAuth2Client();
      const { accessToken, refreshToken, expiresIn, client } = await appClient.loginWithOAuth2({
        code,
        codeVerifier: session.codeVerifier,
        redirectUri: callbackUrl,
      });

      const { data: me } = await client.v2.me();

      const bot = await storage.getBot(session.botId);
      if (!bot || bot.userId !== session.userId) {
        return redirectError("Bot not found");
      }

      const existingConfig = (bot.config as Record<string, unknown>) ?? {};
      await storage.updateBot(session.botId, {
        config: {
          ...existingConfig,
          twitter: {
            // Tokens encrypted at rest — never logged or returned in responses
            accessToken: encryptToken(accessToken),
            refreshToken: refreshToken ? encryptToken(refreshToken) : null,
            expiresAt: Date.now() + (expiresIn ?? 7200) * 1000,
            twitterUserId: me.id,
            twitterUsername: me.username,
            connectedAt: new Date().toISOString(),
            lastPostId: null,
            lastPostText: null,
            lastPostAt: null,
            lastError: null,
          },
        },
      });

      res.redirect(`/?twitter_connected=1&botId=${session.botId}`);
    } catch (err: any) {
      redirectError(err?.data?.detail ?? err.message ?? "OAuth failed");
    }
  });

  // Twitter connection status — never returns tokens
  app.get("/api/bots/:id/twitter/status", requireAuth, async (req, res) => {
    try {
      const botId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      const bot = await storage.getBot(botId);
      if (!bot || bot.userId !== userId) {
        return res.status(404).json({ message: "Bot not found" });
      }

      const cfg = (bot.config as Record<string, any> | null) ?? {};
      const tw = cfg.twitter as Record<string, any> | undefined;

      if (!tw?.accessToken) {
        return res.json({
          connected: false,
          twitterUsername: null,
          twitterUserId: null,
          expiresAt: null,
          lastPostAt: null,
          lastPostText: null,
          lastPostId: null,
          lastError: null,
        });
      }

      res.json({
        connected: true,
        twitterUsername: tw.twitterUsername ?? null,
        twitterUserId: tw.twitterUserId ?? null,
        expiresAt: tw.expiresAt ?? null,
        lastPostAt: tw.lastPostAt ?? null,
        lastPostText: tw.lastPostText ?? null,
        lastPostId: tw.lastPostId ?? null,
        lastError: tw.lastError ?? null,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Post a tweet — decrypts tokens, auto-refreshes if near expiry
  app.post("/api/bots/:id/post", requireAuth, async (req, res) => {
    try {
      const botId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      const bot = await storage.getBot(botId);
      if (!bot || bot.userId !== userId) {
        return res.status(404).json({ message: "Bot not found" });
      }

      const cfg = (bot.config as Record<string, any> | null) ?? {};
      const tw = cfg.twitter as Record<string, any> | undefined;
      if (!tw?.accessToken) {
        return res.status(400).json({ message: "Twitter not connected for this bot" });
      }

      const { text } = req.body;
      if (!text?.trim()) return res.status(400).json({ message: "text is required" });
      if (text.length > 280) return res.status(400).json({ message: "Tweet cannot exceed 280 characters" });

      const { client, updatedTokens } = await getRefreshedClient(tw);

      let tweetId: string;
      let tweetText: string;
      try {
        const tweet = await client.v2.tweet(text);
        tweetId = tweet.data.id;
        tweetText = tweet.data.text;
      } catch (postErr: any) {
        const errMsg = postErr?.data?.detail ?? postErr.message ?? "Tweet failed";
        await storage.updateBot(botId, {
          config: { ...cfg, twitter: { ...tw, ...(updatedTokens ?? {}), lastError: errMsg } },
        });
        throw postErr;
      }

      const now = new Date().toISOString();
      const tweetUrl = `https://x.com/${tw.twitterUsername ?? "i"}/status/${tweetId}`;
      await storage.updateBot(botId, {
        config: {
          ...cfg,
          twitter: {
            ...tw,
            ...(updatedTokens ?? {}),
            lastPostId: tweetId,
            lastPostText: tweetText,
            lastPostAt: now,
            lastError: null,
          },
        },
      });

      res.json({ tweetId, text: tweetText, tweetUrl });
    } catch (err: any) {
      const msg = err?.data?.detail ?? err.message ?? "Failed to post tweet";
      res.status(500).json({ message: msg });
    }
  });

  // Disconnect Twitter — revoke tokens first, then clear config
  app.post("/api/bots/:id/disconnect/twitter", requireAuth, async (req, res) => {
    try {
      const botId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      const bot = await storage.getBot(botId);
      if (!bot || bot.userId !== userId) {
        return res.status(404).json({ message: "Bot not found" });
      }

      const cfg = (bot.config as Record<string, any> | null) ?? {};
      const tw = cfg.twitter as Record<string, any> | undefined;

      if (tw?.accessToken) {
        // Best-effort token revocation — don't block disconnect on failure
        try {
          const appClient = getXOAuth2Client();
          const accessToken = decryptToken(tw.accessToken as string);
          await appClient.revokeOAuth2Token(accessToken, "access_token");
          if (tw.refreshToken) {
            const refreshToken = decryptToken(tw.refreshToken as string);
            await appClient.revokeOAuth2Token(refreshToken, "refresh_token");
          }
        } catch (_) { /* revocation failure is non-fatal */ }
      }

      const { twitter: _removed, ...rest } = cfg;
      await storage.updateBot(botId, { config: rest });

      res.json({ disconnected: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ── Templates (public — browse without auth) ───────────────────────────────

  app.get("/api/templates", async (req, res) => {
    try {
      const category = req.query.category as string;
      const templates = category
        ? await storage.getBotTemplatesByCategory(category)
        : await storage.getAllBotTemplates();
      res.json(templates);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/templates", requireAuth, async (req, res) => {
    try {
      const template = await storage.createBotTemplate(insertBotTemplateSchema.parse(req.body));
      res.json(template);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // ── Analytics ──────────────────────────────────────────────────────────────

  app.get("/api/analytics", requireAuth, async (req, res) => {
    try {
      const analytics = await storage.getAnalyticsByUserId((req as any).user.id);
      res.json(analytics);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/analytics/metrics", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const [revenueMetrics, engagementMetrics] = await Promise.all([
        storage.getRevenueMetrics(userId),
        storage.getEngagementMetrics(userId),
      ]);
      res.json({
        totalRevenue: revenueMetrics.totalRevenue || 0,
        monthlyGrowth: revenueMetrics.monthlyGrowth,
        engagementRate: engagementMetrics.avgEngagement,
        totalPosts: engagementMetrics.totalPosts,
        roi: 340,
        chartData: {
          revenue: { labels: ["Jan","Feb","Mar","Apr","May","Jun"], data: [8500,9200,10100,11300,11800,12450] },
          engagement: { labels: ["TikTok","Instagram","Facebook","Twitter"], data: [35,28,22,15] },
        },
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/analytics", requireAuth, async (req, res) => {
    try {
      const analytics = await storage.createAnalytics(insertAnalyticsSchema.parse(req.body));
      res.json(analytics);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // ── User ───────────────────────────────────────────────────────────────────

  app.get("/api/user/status", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser((req as any).user.id);
      res.json({
        isPremium: user?.isPremium || false,
        botCount: user?.botCount || 0,
        maxBots: user?.isPremium ? "unlimited" : 3,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ── Stripe payments ────────────────────────────────────────────────────────

  app.post("/api/create-payment-intent", requireAuth, async (req, res) => {
    if (!stripe) return res.status(500).json({ message: "Stripe not configured" });
    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "gbp",
        automatic_payment_methods: { enabled: true },
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/upgrade-premium", requireAuth, async (req, res) => {
    try {
      await storage.updateUserPremiumStatus((req as any).user.id, true);
      res.json({ success: true, message: "Account upgraded to premium" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/create-subscription", requireAuth, async (req, res) => {
    if (!stripe) return res.status(500).json({ message: "Stripe not configured" });
    try {
      const userId = (req as any).user.id;
      let user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.stripeSubscriptionId) {
        const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId, {
          expand: ["latest_invoice.payment_intent"],
        });
        if (sub.status === "active") {
          const inv = sub.latest_invoice as any;
          return res.json({ subscriptionId: sub.id, clientSecret: inv?.payment_intent?.client_secret, status: "already_subscribed" });
        }
      }

      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email || `user${userId}@smartflowai.com`,
          name: user.username,
          metadata: { userId: userId.toString() },
        });
        stripeCustomerId = customer.id;
        user = await storage.updateUserStripeInfo(userId, stripeCustomerId, "");
      }

      const price = await stripe.prices.create({
        unit_amount: 2900,
        currency: "gbp",
        recurring: { interval: "month" },
        product_data: { name: "SocialScaleBooster Pro" },
      });

      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: price.id, quantity: 1 }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
      });

      await storage.updateUserStripeInfo(userId, stripeCustomerId, subscription.id);

      const inv = subscription.latest_invoice as any;
      res.json({ subscriptionId: subscription.id, clientSecret: inv?.payment_intent?.client_secret });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.get("/api/subscription-status", requireAuth, async (req, res) => {
    if (!stripe) return res.status(500).json({ message: "Stripe not configured" });
    try {
      const user = await storage.getUser((req as any).user.id);
      if (!user?.stripeSubscriptionId) {
        return res.json({ status: "no_subscription", isPremium: user?.isPremium || false });
      }
      const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      res.json({
        status: sub.status,
        isPremium: user.isPremium,
        subscriptionId: sub.id,
        currentPeriodEnd: new Date((sub as any).current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: (sub as any).cancel_at_period_end,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/cancel-subscription", requireAuth, async (req, res) => {
    if (!stripe) return res.status(500).json({ message: "Stripe not configured" });
    try {
      const user = await storage.getUser((req as any).user.id);
      if (!user?.stripeSubscriptionId) {
        return res.status(404).json({ message: "No active subscription found" });
      }
      const sub = await stripe.subscriptions.update(user.stripeSubscriptionId, { cancel_at_period_end: true });
      res.json({
        message: "Subscription will be cancelled at the end of the billing period",
        cancelAtPeriodEnd: (sub as any).cancel_at_period_end,
        currentPeriodEnd: new Date((sub as any).current_period_end * 1000).toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ── Stripe Webhook ─────────────────────────────────────────────────────────
  // Raw body is parsed in index.ts before express.json() for signature verification.

  app.post("/api/webhook", async (req, res) => {
    if (!stripe) return res.status(500).json({ message: "Stripe not configured" });

    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      return res.status(400).json({ message: "Missing stripe-signature header or STRIPE_WEBHOOK_SECRET" });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      return res.status(400).json({ message: `Webhook signature verification failed: ${err.message}` });
    }

    try {
      switch (event.type) {
        case "customer.subscription.updated": {
          const sub = event.data.object as Stripe.Subscription;
          const customerId = sub.customer as string;
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
          const userId = parseInt((customer.metadata as any)?.userId);
          if (userId) {
            const isPremium = sub.status === "active";
            await storage.updateUserPremiumStatus(userId, isPremium);
            if (isPremium) {
              await storage.updateUserStripeInfo(userId, customerId, sub.id);
            }
          }
          break;
        }
        case "customer.subscription.deleted": {
          const sub = event.data.object as Stripe.Subscription;
          const customerId = sub.customer as string;
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
          const userId = parseInt((customer.metadata as any)?.userId);
          if (userId) {
            await storage.updateUserPremiumStatus(userId, false);
          }
          break;
        }
        case "invoice.payment_succeeded": {
          const inv = event.data.object as Stripe.Invoice;
          const customerId = inv.customer as string;
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
          const userId = parseInt((customer.metadata as any)?.userId);
          if (userId) {
            await storage.updateUserPremiumStatus(userId, true);
          }
          break;
        }
        case "invoice.payment_failed": {
          // Log only — don't revoke access immediately; Stripe retries
          console.warn(`Payment failed for customer: ${event.data.object}`);
          break;
        }
      }
      res.json({ received: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ── Post generator (public demo tool) ─────────────────────────────────────

  app.get("/post-generator", (_req, res) => {
    res.redirect("/");
  });

  app.post("/api/generate-posts", async (req, res) => {
    try {
      const { topic, tone, platform } = req.body;
      if (!topic) return res.status(400).json({ error: "Topic is required" });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a creative social media expert who creates engaging, concise posts that drive engagement and conversions." },
          { role: "user", content: `Generate 3 unique social media posts about "${topic}" with a ${tone} tone for ${platform}.\n\nRequirements:\n- Each post must be under 280 characters\n- Include relevant hashtags\n- Vary the style for each post\n\nReturn only the 3 posts, separated by "---" with no additional text.` },
        ],
        max_tokens: 500,
        temperature: 0.8,
      });

      const content = completion.choices[0].message.content;
      if (!content) throw new Error("No content generated");

      const posts = content.split("---").map(p => p.trim()).filter(Boolean).slice(0, 3);
      if (posts.length < 3) throw new Error("Not enough posts generated");

      res.json({ posts, topic, tone, platform });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to generate posts", details: err.message });
    }
  });

  // ── Server ─────────────────────────────────────────────────────────────────

  const httpServer = createServer(app);
  const analyticsWS = new AnalyticsWebSocketServer(httpServer);
  process.on("SIGTERM", () => analyticsWS.close());

  return httpServer;
}
