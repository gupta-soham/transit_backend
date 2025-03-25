import { Request, Response, NextFunction } from 'express';
import { verifyToken, generateAccessToken } from '../utils/jwtService';
import { prisma } from '../prismaClient';
import { JwtPayload } from 'jsonwebtoken';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({ message: "No access token" });
    }

    // Verify access token
    const decoded = verifyToken(accessToken) as JwtPayload;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { 
        id: true, 
        email: true, 
        name: true,
        emailVerified: true 
      }
    });

    if (!user || !user.emailVerified) {
      return res.status(401).json({ message: "Invalid user or unverified email" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    // If access token is invalid, attempt to refresh
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token" });
      }

      // Your existing refresh token logic here
      const decoded = verifyToken(refreshToken) as JwtPayload;
      const newAccessToken = generateAccessToken(decoded.id);
      
      if (newAccessToken) {
        res.cookie('accessToken', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        // Re-authenticate with new token
        return authenticate(req, res, next);
      }
    } catch {
      return res.status(401).json({ message: "Authentication failed" });
    }
  }
};