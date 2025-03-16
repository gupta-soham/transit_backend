import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtService';

interface AuthRequest extends Request {
  user?: any; // can replace 'any' with a more specific type if you have a user type defined
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};