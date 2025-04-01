import { Router, RequestHandler } from 'express';
import { getProfile, updateProfile } from '../../controllers/auth_private';
import { authenticate } from '../../middlewares/authMiddleware';
import { sendContactEmail } from '../../utils/emailService';
import { limiter } from '../../middlewares/rateLimiter';
import { contact_adver_Schema } from '../../validations/authValidation';
import { sendContact_adver_Email } from '../../utils/emailService';
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

userRoutes.post('/contactAdver', limiter, async (req, res): Promise<any> => {
    try {
        // Validate the request body using the contact schema
        const validatedData = contact_adver_Schema.parse(req.body);
        
        // Update the interested field to default to false if not provided
        const contactData = {
            ...validatedData,
            interested: validatedData.interested ?? false
        };

        // Send contact emails with the full contact data
        await sendContact_adver_Email({
            firstName: contactData.firstName,
            lastName: contactData.lastName,
            email: contactData.companyEmail,
            message: contactData.message,
            phone: contactData.phone,
            country: contactData.country,
            industry: contactData.industry,
            companyName: contactData.companyName,
            companyWebsite: contactData.companyWebsite,
            interested: contactData.interested
        });

        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Contact form submitted successfully'
        });
    } catch (error) {
        if (error) {
            // Return validation errors
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error
            });
        }
        
        console.error('Contact form submission error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process contact form submission'
        });
    }
});

export default userRoutes;
