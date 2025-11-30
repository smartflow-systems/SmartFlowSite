import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthRequest extends Request {
  userId?: number;
  user?: {
    id: number;
    email: string;
    subscriptionTier: string;
  };
}

export default function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    // Ensure Authorization header exists and starts with 'Bearer '
    if (!authHeader || typeof authHeader !== 'string') {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Properly extract token - ensure it's actually a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid authorization format' });
    }

    const token = authHeader.substring(7).trim(); // Extract token after 'Bearer '

    if (!token || token.length === 0) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    // Verify JWT_SECRET is properly configured
    if (!JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
      console.error('SECURITY WARNING: JWT_SECRET not properly configured!');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      email: string;
      subscriptionTier: string;
    };

    // Validate decoded token has required fields
    if (!decoded.userId || !decoded.email || !decoded.subscriptionTier) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    req.userId = decoded.userId;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      subscriptionTier: decoded.subscriptionTier,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    } else if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Authentication failed' });
  }
}
