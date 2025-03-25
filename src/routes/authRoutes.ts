import { Request, Response, RequestHandler, Router } from 'express';
import {
  googleauth,
  login,
  logout,
  refreshAccessToken,
  register,
  resendVerificationEmail,
  resetPassword,
  sendOtpToPhone,
  sendResetEmailController,
  updateUserDetails,
  verifyEmail,
  verifyOtp
} from '../controllers/authController';

import passport from 'passport';
import { authenticate } from "../middlewares/authMiddleware";
import { limiter } from "../middlewares/rateLimiter";

const router = Router();


// User registration
router.post('/register', limiter, (register as unknown) as RequestHandler);


// Email verification
router.get('/verify-email', (verifyEmail as unknown) as RequestHandler);

// Resend email verification
router.post('/resend-email', limiter, (resendVerificationEmail as unknown) as RequestHandler);

// User login
router.post('/login', limiter, (login as unknown) as RequestHandler);

//add more details authenicate user
router.put("/addDetails", (authenticate as unknown) as RequestHandler, updateUserDetails as unknown as RequestHandler);

// Refresh access token
router.post('/refresh-token', (refreshAccessToken as unknown) as RequestHandler);

// Logout
router.post('/logout', (logout as unknown) as RequestHandler);

// Send OTP to phone number
router.post('/send-otp', limiter, (sendOtpToPhone as unknown) as RequestHandler);

// Verify OTP
router.post('/verify-otp', (verifyOtp as unknown) as RequestHandler);

// Route to start Google authentication
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleauth as unknown as RequestHandler
);

// Logout
router.get("/logout-session", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    const redirectUrl = process.env.FRONTEND_APP_URL || 'http://localhost:5173';
    res.redirect(redirectUrl);
  });
});

// Get current user
router.get('/current_user', (authenticate as unknown) as RequestHandler, ((req: Request, res: Response) => {
  if (req.user) {
    return res.status(200).json({ 
      id: (req.user as any).id, 
      email: (req.user as any).email,
      name: (req.user as any).name,
      emailVerified: (req.user as any).emailVerified
    });
  }
  return res.status(401).json({ message: "Not authenticated" });
}) as unknown as RequestHandler);

// Request password reset  
router.post('/request-reset', sendResetEmailController as unknown as RequestHandler);

// Reset password
router.post('/reset-password', resetPassword as unknown as RequestHandler);

export default router;
