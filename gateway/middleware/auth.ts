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
    // Extract Authorization header
    const authHeader = req.headers.authorization;
    
    // Validate header format (not the security control - jwt.verify is)
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // SECURITY CONTROL: Cryptographically verify JWT signature
    // This prevents user from forging tokens - the JWT_SECRET is server-controlled
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
