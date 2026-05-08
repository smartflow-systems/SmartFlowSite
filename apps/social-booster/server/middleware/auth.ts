import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sfs-dev-secret-change-in-production';

export interface AuthRequest extends Request {
  userId?: number;
  user?: {
    id: number;
    username: string;
    email: string;
    isPremium: boolean;
  };
}

export interface JWTPayload {
  userId: number;
  username: string;
  email: string;
  isPremium: boolean;
}

/**
 * Middleware to authenticate JWT tokens
 * Adds user info to request object if valid
 */
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    req.userId = payload.userId;
    req.user = {
      id: payload.userId,
      username: payload.username,
      email: payload.email,
      isPremium: payload.isPremium
    };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Optional auth middleware - adds user if token exists but doesn't require it
 */
export function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
      req.userId = payload.userId;
      req.user = {
        id: payload.userId,
        username: payload.username,
        email: payload.email,
        isPremium: payload.isPremium
      };
    } catch (error) {
      // Invalid token but continue anyway
    }
  }

  next();
}

/**
 * Generate JWT token for user
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Refresh token with extended expiration
 */
export function refreshToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return generateToken(payload);
  } catch (error) {
    return null;
  }
}
