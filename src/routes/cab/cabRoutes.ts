import axios from 'axios';
import express, { Request, Response, RequestHandler } from 'express';
import { authenticate } from '../../middlewares/authMiddleware';
import { BookingIdSchema, BookingRequestSchema, CancelBookingSchema, TripRequestSchema, UpdateBookingSchema } from "../../validations/cabValidation";

const cabRoutes = express.Router();
const authorization = process.env.GOZO_API_AUTH;

if (!authorization || !process.env.GOZO_API_URL) {
    throw new Error('Authorization key not found in environment variables');
}

// Route to get trip quotes
cabRoutes.post('/getQuote', async (req: Request, res: Response): Promise<any> => {
    try {
        const result = TripRequestSchema.safeParse(req.body);

        if (!result.success) {
            const formattedErrors = result.error.errors.map(error => ({
                path: error.path.join('.'),
                message: error.message
            }));
            return res.status(400).json({
                error: 'Validation failed',
                details: formattedErrors
            });
        }

        const { tripType, cabType, routes } = result.data;

        // Prepare the request data
        const requestData = {
            tripType,
            cabType,
            routes: routes.map(route => ({
                startDate: route.startDate,
                startTime: route.startTime,
                source: {
                    address: route.source.address,
                    name: route.source.name,
                    coordinates: {
                        latitude: route.source.coordinates.latitude,
                        longitude: route.source.coordinates.longitude
                    }
                },
                destination: {
                    address: route.destination.address,
                    name: route.destination.name,
                    coordinates: {
                        latitude: route.destination.coordinates.latitude,
                        longitude: route.destination.coordinates.longitude
                    }
                }
            }))
        };

        const response = await axios({
            method: 'post',
            url: `${process.env.GOZO_API_URL}/api/cpapi/booking/getQuote`,
            headers: { 'Authorization': `Basic ${authorization}` },
            data: requestData
        });

        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching trip quote:', error);
        return res.status(500).json({
            error: 'Failed to fetch trip quote',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Route to book a cab
cabRoutes.post('/book', (authenticate as unknown) as RequestHandler, async (req: Request, res: Response): Promise<any> => {
    try {
        const result = BookingRequestSchema.safeParse(req.body);

        if (!result.success) {
            const formattedErrors = result.error.errors.map(error => ({
                path: error.path.join('.'),
                message: error.message
            }));

            return res.status(400).json({
                error: 'Validation failed',
                details: formattedErrors
            });
        }

        const response = await axios({
            method: 'post',
            url: `${process.env.GOZO_API_URL}/api/cpapi/booking/hold`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authorization}`
            },
            data: result.data
        });

        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error booking cab:', error);
        return res.status(500).json({
            error: 'Failed to book cab',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Route to confirm booking
cabRoutes.post('/confirmBooking', async (req: Request, res: Response): Promise<any> => {
    try {
        const result = BookingIdSchema.safeParse(req.body);

        if (!result.success) {
            const formattedErrors = result.error.errors.map(error => ({
                path: error.path.join('.'),
                message: error.message
            }));

            return res.status(400).json({
                error: 'Validation failed',
                details: formattedErrors
            });
        }

        const { bookingId } = result.data;

        const response = await axios({
            method: 'post',
            url: `${process.env.GOZO_API_URL}/api/cpapi/booking/confirm`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authorization}`
            },
            data: { bookingId }
        });

        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error confirming booking:', error);
        return res.status(500).json({
            error: 'Failed to confirm booking',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Route to get booking details
cabRoutes.get('/getBookingDetails', async (req: Request, res: Response): Promise<any> => {
    try {
        const result = BookingIdSchema.safeParse(req.body);

        if (!result.success) {
            const formattedErrors = result.error.errors.map(error => ({
                path: error.path.join('.'),
                message: error.message
            }));

            return res.status(400).json({
                error: 'Validation failed',
                details: formattedErrors
            });
        }

        const { bookingId } = result.data;

        const response = await axios({
            method: 'post',
            url: `${process.env.GOZO_API_URL}/api/cpapi/booking/getDetails`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authorization}`
            },
            data: { bookingId }
        });

        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching booking details:', error);
        return res.status(500).json({
            error: 'Failed to fetch booking details',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Route to update booking
cabRoutes.post('/updateBooking', (authenticate as unknown) as RequestHandler, async (req: Request, res: Response): Promise<any> => {
    try {
        const result = UpdateBookingSchema.safeParse(req.body);

        if (!result.success) {
            const formattedErrors = result.error.errors.map(error => ({
                path: error.path.join('.'),
                message: error.message
            }));

            return res.status(400).json({
                error: 'Validation failed',
                details: formattedErrors
            });
        }

        const response = await axios({
            method: 'post',
            url: `${process.env.GOZO_API_URL}/api/cpapi/booking/updateBooking`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authorization}`
            },
            data: result.data
        });

        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error updating booking:', error);
        return res.status(500).json({
            error: 'Failed to update booking',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Route to get Terms and Conditions
cabRoutes.get('/getTermsAndConditions', async (req: Request, res: Response): Promise<any> => {
    try {
        const response = await axios({
            method: 'post',
            url: `${process.env.GOZO_API_URL}/api/cpapi/booking/getTnc`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authorization}`
            },
        });

        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching terms and conditions:', error);
        return res.status(500).json({
            error: 'Failed to fetch terms and conditions',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Route to get Cancellation Reasons List
cabRoutes.get('/getCancellationReasons', async (req: Request, res: Response): Promise<any> => {
    try {
        const response = await axios({
            method: 'post',
            url: `${process.env.GOZO_API_URL}/api/cpapi/booking/getCancellationList`,
            headers: {
                'Authorization': `Basic ${authorization}`
            },
        });

        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching cancellation reasons:', error);
        return res.status(500).json({
            error: 'Failed to fetch cancellation reasons',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Route to cancel booking
cabRoutes.post('/cancelBooking', (authenticate as unknown) as RequestHandler, async (req: Request, res: Response): Promise<any> => {
    try {
        const result = CancelBookingSchema.safeParse(req.body);

        if (!result.success) {
            const formattedErrors = result.error.errors.map(error => ({
                path: error.path.join('.'),
                message: error.message
            }));

            return res.status(400).json({
                error: 'Validation failed',
                details: formattedErrors
            });
        }

        const { bookingId, reason, reasonId } = result.data;

        const response = await axios({
            method: 'post',
            url: `${process.env.GOZO_API_URL}/api/cpapi/booking/cancelBooking`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authorization}`
            },
            data: { bookingId, reason, reasonId }
        });

        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error cancelling booking:', error);
        return res.status(500).json({
            error: 'Failed to cancel booking',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default cabRoutes;
