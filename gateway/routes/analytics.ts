import { Router } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Service URLs
const MARKETING_URL = process.env.MARKETING_SERVICE_URL || 'http://localhost:3001';
const SOCIAL_URL = process.env.SOCIAL_SERVICE_URL || 'http://localhost:3002';
const SCRAPER_URL = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3003';
const QUERY_URL = process.env.QUERY_SERVICE_URL || 'http://localhost:3004';

/**
 * GET /api/unified/analytics/campaigns/:id
 *
 * Aggregates campaign data from all services:
 * - Marketing: UTM links, AI posts, calendar events
 * - Social: Bot posts, engagement metrics
 * - Scraper: Scraped data, competitor insights
 * - Query: SQL queries, dashboards
 */
router.get('/campaigns/:id', async (req: AuthRequest, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const token = req.headers.authorization;

    // Fetch data from all services in parallel
    const [marketingData, socialData, scraperData, queryData] = await Promise.allSettled([
      // Marketing & Growth analytics
      axios.get(`${MARKETING_URL}/api/campaigns/${campaignId}/analytics`, {
        headers: { Authorization: token },
      }).then(r => r.data).catch(() => null),

      // Social Bot analytics (placeholder - implement when available)
      axios.get(`${SOCIAL_URL}/api/bots/campaign/${campaignId}/analytics`, {
        headers: { Authorization: token },
      }).then(r => r.data).catch(() => ({ totalPosts: 0, engagement: 0 })),

      // Scraper analytics (placeholder - implement when available)
      axios.get(`${SCRAPER_URL}/api/scrapers/campaign/${campaignId}/analytics`, {
        headers: { Authorization: token },
      }).then(r => r.data).catch(() => ({ totalScrapes: 0, dataPoints: 0 })),

      // Query Engine analytics (placeholder - implement when available)
      axios.get(`${QUERY_URL}/api/queries/campaign/${campaignId}/analytics`, {
        headers: { Authorization: token },
      }).then(r => r.data).catch(() => ({ totalQueries: 0, dashboards: 0 })),
    ]);

    // Extract data from settled promises
    const marketing = marketingData.status === 'fulfilled' ? marketingData.value : null;
    const social = socialData.status === 'fulfilled' ? socialData.value : null;
    const scraper = scraperData.status === 'fulfilled' ? scraperData.value : null;
    const query = queryData.status === 'fulfilled' ? queryData.value : null;

    // Aggregate analytics
    const unifiedAnalytics = {
      campaignId,
      campaign: marketing?.campaign || null,

      // Marketing metrics
      marketing: {
        utmLinks: marketing?.analytics?.totalUtmLinks || 0,
        clicks: marketing?.analytics?.totalClicks || 0,
        posts: marketing?.analytics?.totalPosts || 0,
        bioPageViews: marketing?.analytics?.events || 0,
      },

      // Social media metrics
      social: {
        totalPosts: social?.totalPosts || 0,
        scheduledPosts: social?.scheduledPosts || 0,
        engagement: social?.engagement || 0,
        reach: social?.reach || 0,
      },

      // Scraping metrics
      scraper: {
        totalScrapes: scraper?.totalScrapes || 0,
        dataPoints: scraper?.dataPoints || 0,
        competitorInsights: scraper?.insights || 0,
      },

      // Query metrics
      query: {
        totalQueries: query?.totalQueries || 0,
        dashboards: query?.dashboards || 0,
        dataExports: query?.exports || 0,
      },

      // Overall metrics
      overall: {
        totalActivities: (
          (marketing?.analytics?.events || 0) +
          (social?.totalPosts || 0) +
          (scraper?.totalScrapes || 0) +
          (query?.totalQueries || 0)
        ),
        totalEngagement: (
          (marketing?.analytics?.totalClicks || 0) +
          (social?.engagement || 0)
        ),
      },

      // Timeline of events from all services
      timeline: [
        ...(marketing?.recentEvents || []).map((e: any) => ({
          ...e,
          service: 'marketing',
        })),
      ].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 50),
    };

    res.json(unifiedAnalytics);
  } catch (error) {
    console.error('Unified analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch unified analytics' });
  }
});

/**
 * GET /api/unified/analytics/overview
 *
 * User's overall analytics across all campaigns and services
 */
router.get('/overview', async (req: AuthRequest, res) => {
  try {
    const token = req.headers.authorization;

    // Fetch overview from all services
    const [marketingOverview, socialOverview, scraperOverview, queryOverview] = await Promise.allSettled([
      axios.get(`${MARKETING_URL}/api/campaigns`, {
        headers: { Authorization: token },
      }).then(r => r.data).catch(() => []),

      axios.get(`${SOCIAL_URL}/api/bots`, {
        headers: { Authorization: token },
      }).then(r => r.data).catch(() => []),

      axios.get(`${SCRAPER_URL}/api/scrapers`, {
        headers: { Authorization: token },
      }).then(r => r.data).catch(() => []),

      axios.get(`${QUERY_URL}/api/queries`, {
        headers: { Authorization: token },
      }).then(r => r.data).catch(() => []),
    ]);

    const marketing = marketingOverview.status === 'fulfilled' ? marketingOverview.value : [];
    const social = socialOverview.status === 'fulfilled' ? socialOverview.value : [];
    const scraper = scraperOverview.status === 'fulfilled' ? scraperOverview.value : [];
    const query = queryOverview.status === 'fulfilled' ? queryOverview.value : [];

    res.json({
      campaigns: {
        total: marketing.length,
        active: marketing.filter((c: any) => c.status === 'active').length,
        draft: marketing.filter((c: any) => c.status === 'draft').length,
      },
      social: {
        totalBots: social.length,
        activeBots: social.filter((b: any) => b.isActive).length,
      },
      scraper: {
        totalScrapers: scraper.length,
        activeScrapers: scraper.filter((s: any) => s.isActive).length,
      },
      query: {
        totalQueries: query.length,
        savedQueries: query.filter((q: any) => q.saved).length,
      },
      services: {
        marketing: marketing.length > 0,
        social: social.length > 0,
        scraper: scraper.length > 0,
        query: query.length > 0,
      },
    });
  } catch (error) {
    console.error('Overview analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

/**
 * GET /api/unified/analytics/performance
 *
 * Performance metrics across all services for a date range
 */
router.get('/performance', async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.query;

    // TODO: Implement date-range analytics from all services

    res.json({
      period: { startDate, endDate },
      metrics: {
        totalActivities: 0,
        totalEngagement: 0,
        totalRevenue: 0,
        growthRate: 0,
      },
      breakdown: {
        byService: {},
        byDay: {},
        byChannel: {},
      },
    });
  } catch (error) {
    console.error('Performance analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

export default router;
