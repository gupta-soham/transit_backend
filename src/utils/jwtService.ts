import jwt from 'jsonwebtoken';

// Legacy function to generate JWTs
export const generateToken = (userId: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Generate access token with 15-minute expiration
export const generateAccessToken = (userId: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// Verify access token
export const verifyToken = (token: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Generate refresh token with 30-day expiration
export const generateRefreshToken = (userId: string) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
};

// Verify refresh token
export const verifyRefreshToken = (token: string) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};
