import { Request, Response, NextFunction } from 'express';

export interface CampaignRequest extends Request {
  campaignId?: number;
}

/**
 * Campaign Tracking Middleware
 *
 * Extracts campaign ID from:
 * 1. Request body (campaignId field)
 * 2. Query parameters (?campaignId=123)
 * 3. Custom header (X-Campaign-ID)
 *
 * Adds it to the request object for forwarding to microservices
 */
export default function campaignTracker(
  req: CampaignRequest,
  res: Response,
  next: NextFunction
) {
  // Check body
  if (req.body && req.body.campaignId) {
    req.campaignId = parseInt(req.body.campaignId);
  }

  // Check query params
  if (req.query && req.query.campaignId) {
    req.campaignId = parseInt(req.query.campaignId as string);
  }

  // Check headers
  const headerCampaignId = req.get('X-Campaign-ID');
  if (headerCampaignId) {
    req.campaignId = parseInt(headerCampaignId);
  }

  next();
}
