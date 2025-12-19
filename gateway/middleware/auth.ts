import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// SECURITY WARNING: Ensure JWT_SECRET is set in production
if (JWT_SECRET === 'your-secret-key-change-in-production') {
  console.error('⚠️  CRITICAL: JWT_SECRET not set in environment variables!');
}

export interface AuthRequest extends Request {
  userId?: number;
  user?: {
    id: number;
    email: string;
    subscriptionTier: string;
  };
}

/**
 * Authentication middleware
 * SECURITY: Validates JWT tokens using cryptographic signature verification
 */
export default function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    // Input validation: Ensure proper format
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);

    // Empty token check
    if (!token || token.length === 0) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    // CRITICAL SECURITY CONTROL: Cryptographic JWT verification
    // This verifies the signature using the server-side secret
    // Users cannot forge valid tokens without knowing JWT_SECRET
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      email: string;
      subscriptionTier: string;
    };

    // Attach verified user data to request
    req.userId = decoded.userId;
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      subscriptionTier: decoded.subscriptionTier,
    };

    next();
  } catch (error) {
    // jwt.verify() throws on invalid signature, expiration, or malformed token
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
