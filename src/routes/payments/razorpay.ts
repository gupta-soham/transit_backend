import express from 'express';
import { z } from 'zod';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { validateRequest } from '../../middlewares/paymentMiddleware';
import { isValidPhoneNumber } from 'libphonenumber-js';

// Zod schema for order creation
const CreateOrderSchema = z.object({
    amount: z.number().min(25, 'Amount must be at least 25'),
    currency: z.string().default('INR'),
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits long')
        .max(15, 'Phone number must be at most 15 digits long')
        .refine(value => isValidPhoneNumber("+91" + value), {
            message: 'Invalid phone number format'
        }),
});

// Zod schema for payment verification
const VerifyPaymentSchema = z.object({
    razorpay_order_id: z.string(),
    razorpay_payment_id: z.string(),
    razorpay_signature: z.string()
});

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!
});

const razorpayRoutes = express.Router();

// Create Order Route
razorpayRoutes.post(
    '/create-order',
    validateRequest({ body: CreateOrderSchema }),
    async (req, res) => {
        try {
            const { amount, currency, name, email, phoneNumber } = req.body;

            const options = {
                amount: amount * 100, // Convert to paise or cents
                currency,
                receipt: `receipt_${Date.now()}`,
                notes: {
                    name,
                    email,
                    phoneNumber
                }
            };

            const order = await razorpay.orders.create(options);

            res.status(200).json({
                id: order.id,
                amount: order.amount,
                currency: order.currency
            });
        } catch (error) {
            console.error('Error creating order:', error);
            res.status(500).json({ error: 'Failed to create order' });
        }
    }
);

// Verify Payment Route
razorpayRoutes.post(
    '/verify-payment',
    validateRequest({ body: VerifyPaymentSchema }),
    (req, res) => {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        // Generate signature
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        // Compare signatures
        if (generated_signature === razorpay_signature) {
            res.status(200).json({
                status: 'success',
                message: 'Payment verified successfully'
            });
        } else {
            res.status(400).json({
                status: 'failed',
                message: 'Payment verification failed'
            });
        }
    }
);

export default razorpayRoutes;
