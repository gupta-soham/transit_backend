import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtService';

interface AuthRequest extends Request {
  user?: any; // can replace 'any' with a more specific type if you have a user type defined
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Try to get token from cookies first, then from Authorization header as fallback
  const accessToken = req.cookies?.accessToken || req.headers['authorization']?.split(' ')[1];

  if (!accessToken) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const decoded = verifyToken(accessToken);
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};