import { Router, RequestHandler } from 'express';
import {
  register,
  verifyEmail,
  login,
  sendOtpToPhone,
  verifyOtp,
  resetPassword,
  sendResetEmailController,
  googleauth,
  updateUserDetails,
  refreshAccessToken,
  logout
} from '../controllers/authController';

import { getProfile, updateProfile } from '../controllers/auth_private';
import { authenticate } from "../middlewares/authMiddleware";
import { limiter } from '../middlewares/rateLimiter';
import passport from 'passport';

const router = Router();


// User registration
router.post('/register', (register as unknown) as RequestHandler);


// Email verification
router.get('/verify-email', (verifyEmail as unknown) as RequestHandler);

// User login
router.post('/login', limiter, (login as unknown) as RequestHandler);

//add more details authenicate user
router.put("/addDetails", authenticate, updateUserDetails as unknown as RequestHandler);

// Refresh access token
router.post('/refresh-token', (refreshAccessToken as unknown) as RequestHandler);

// Logout
router.post('/logout', (logout as unknown) as RequestHandler);

// Send OTP to phone number
router.post('/send-otp', (sendOtpToPhone as unknown) as RequestHandler);

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
router.get('/current_user', (req, res) => {
  res.send(req.user);
});

// Request password reset  
router.post('/request-reset', sendResetEmailController as unknown as RequestHandler);

// Reset password
router.post('/reset-password', resetPassword as unknown as RequestHandler);

export default router;
