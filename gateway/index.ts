/**
 * SmartFlow Systems - Unified API Gateway
 *
 * Routes requests to all SFS microservices:
 * - Marketing & Growth (port 3001)
 * - SocialScaleBoosterAIbot (port 3002)
 * - DataScrapeInsights (port 3003)
 * - SFSDataQueryEngine (port 3004)
 *
 * Features:
 * - Shared authentication
 * - Cross-project campaign tracking
 * - Unified analytics
 * - Rate limiting
 * - Request logging
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import authMiddleware from './middleware/auth';
import campaignTracker from './middleware/campaign-tracker';
import analyticsRouter from './routes/analytics';
import rateLimit from 'express-rate-limit';
dotenv.config();

const app = express();
const PORT = process.env.GATEWAY_PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

app.use(express.json());

// Analytics endpoint rate limiter (per-IP)
const analyticsRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit to 100 requests per windowMs per IP
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    gateway: 'SmartFlow Systems Unified API',
    version: '1.0.0',
    services: {
      marketing: process.env.MARKETING_SERVICE_URL || 'http://localhost:3001',
      social: process.env.SOCIAL_SERVICE_URL || 'http://localhost:3002',
      scraper: process.env.SCRAPER_SERVICE_URL || 'http://localhost:3003',
      query: process.env.QUERY_SERVICE_URL || 'http://localhost:3004',
    },
    timestamp: new Date().toISOString(),
  });
});

// Unified Analytics Endpoint (cross-project)
app.use('/api/unified/analytics', analyticsRateLimiter, authMiddleware, analyticsRouter);

// Marketing & Growth Service
app.use('/api/marketing', createProxyMiddleware({
  target: process.env.MARKETING_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: { '^/api/marketing': '/api' },
  onProxyReq: (proxyReq, req: any) => {
    // Forward auth token
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
    // Add campaign tracking
    if (req.campaignId) {
      proxyReq.setHeader('X-Campaign-ID', req.campaignId);
    }
  },
}));

// Social Media Bot Service
app.use('/api/social', createProxyMiddleware({
  target: process.env.SOCIAL_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: { '^/api/social': '/api' },
  onProxyReq: (proxyReq, req: any) => {
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
    if (req.campaignId) {
      proxyReq.setHeader('X-Campaign-ID', req.campaignId);
    }
  },
}));

// Data Scraper Service
app.use('/api/scraper', createProxyMiddleware({
  target: process.env.SCRAPER_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: { '^/api/scraper': '/api' },
  onProxyReq: (proxyReq, req: any) => {
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
    if (req.campaignId) {
      proxyReq.setHeader('X-Campaign-ID', req.campaignId);
    }
  },
}));

// Query Engine Service
app.use('/api/query', createProxyMiddleware({
  target: process.env.QUERY_SERVICE_URL || 'http://localhost:3004',
  changeOrigin: true,
  pathRewrite: { '^/api/query': '/api' },
  onProxyReq: (proxyReq, req: any) => {
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
    if (req.campaignId) {
      proxyReq.setHeader('X-Campaign-ID', req.campaignId);
    }
  },
}));

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Gateway error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Gateway error',
    service: err.service || 'unknown',
  });
});

// Start gateway
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🌐 SmartFlow Systems - Unified API Gateway              ║
║                                                           ║
║   Gateway running on port ${PORT}                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                        ║
║                                                           ║
║   Services:                                               ║
║   • Marketing: ${process.env.MARKETING_SERVICE_URL || 'http://localhost:3001'}        ║
║   • Social:    ${process.env.SOCIAL_SERVICE_URL || 'http://localhost:3002'}        ║
║   • Scraper:   ${process.env.SCRAPER_SERVICE_URL || 'http://localhost:3003'}        ║
║   • Query:     ${process.env.QUERY_SERVICE_URL || 'http://localhost:3004'}        ║
║                                                           ║
║   Health: http://localhost:${PORT}/health                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
