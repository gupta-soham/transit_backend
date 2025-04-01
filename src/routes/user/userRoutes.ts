import { Router, RequestHandler } from 'express';
import { getProfile, updateProfile } from '../../controllers/auth_private';
import { authenticate } from '../../middlewares/authMiddleware';
import { sendContactEmail } from '../../utils/emailService';
import { limiter } from '../../middlewares/rateLimiter';
const userRoutes = Router();


userRoutes.get('/profile/details', (authenticate as unknown) as RequestHandler, getProfile as unknown as RequestHandler);
userRoutes.put('/profile/update', (authenticate as unknown) as RequestHandler, updateProfile as unknown as RequestHandler);

userRoutes.post('/contact', limiter, async (req, res): Promise<any> => {
    try {
        const { email, name, message, mobile } = req.body;

        // Validate required fields
        if (!email || !name || !message) {
            return res.status(400).json({
                success: false,
                message: 'Email, name, and message are required fields'
            });
        }

        // Send contact emails
        await sendContactEmail({ email, name, message, mobile });

        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Contact form submitted successfully'
        });
    } catch (error) {
        console.error('Contact form submission error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process contact form submission'
        });
    }
})

export default userRoutes;
