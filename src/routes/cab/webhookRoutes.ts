import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../prismaClient';

// ==================== Types and Interfaces ====================

interface CabDriverUpdateData {
    bookingId: string;
    orderRefId: string;
    statusDesc: string;
    otp: string;
    car: {
        isAttached: number;
        id: number;
        model: string;
        number: string;
        hasCNG: number;
        roofTop: number;
        licensePlate: Array<any>;
        category: {
            id: number;
        };
        hasElectric: number;
    };
    driver: {
        name: string;
        contact: {
            code: string;
            number: number;
        };
    };
}

interface TripUpdateData {
    bookingId: string;
    orderRefId: string;
    bookingStatus: string;
    tripdata: {
        tripStatus?: number;
        startDate?: string;
        startTime?: string;
        endDate?: string;
        endTime?: string;
        coordinates: {
            latitude: string;
            longitude: string;
        };
    };
}

interface TripCancelData {
    bookingId: string;
    orderRefId: string;
    message: string;
    cancellationCharge: number;
    refundAmount: number;
    reason: string;
}

interface WebhookData {
    type: string;
    data: CabDriverUpdateData | TripUpdateData | TripCancelData;
}

// ==================== Middleware ====================

const validateWebhookToken = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('token ')) {
            console.warn('Unauthorized webhook attempt - missing or invalid token format');
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const expectedToken = process.env.WEBHOOK_TOKEN;

        if (token !== expectedToken) {
            console.warn('Unauthorized webhook attempt - invalid token');
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        next();
    } catch (error) {
        console.error('Error in webhook authentication:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// ==================== Controller Functions ====================

const handleCabDriverUpdate = async (data: CabDriverUpdateData) => {
    const { bookingId, orderRefId, statusDesc, otp, car, driver } = data;

    // Find or create the booking
    const booking = await prisma.booking.findUnique({
        where: { bookingId },
    });

    // Find or create the cab
    let cab = await prisma.cab.findUnique({
        where: { cabId: car.id },
    });

    if (!cab) {
        // Convert license plates to string array
        const licensePlateArray = car.licensePlate
            ? car.licensePlate.map(plate => plate.toString())
            : [];

        cab = await prisma.cab.create({
            data: {
                cabId: car.id,
                model: car.model,
                number: car.number,
                hasCNG: Boolean(car.hasCNG),
                hasElectric: Boolean(car.hasElectric),
                roofTop: Boolean(car.roofTop),
                isAttached: Boolean(car.isAttached),
                licensePlate: licensePlateArray
            },
        });
    } else {
        // Convert license plates to string array
        const licensePlateArray = car.licensePlate
            ? car.licensePlate.map(plate => plate.toString())
            : [];

        // Update cab info
        await prisma.cab.update({
            where: { cabId: car.id },
            data: {
                model: car.model,
                number: car.number,
                hasCNG: Boolean(car.hasCNG),
                hasElectric: Boolean(car.hasElectric),
                roofTop: Boolean(car.roofTop),
                isAttached: Boolean(car.isAttached),
                licensePlate: licensePlateArray
            }
        });
    }

    // Find or create the driver
    let driverRecord = await prisma.driver.findFirst({
        where: {
            name: driver.name,
            contactNumber: driver.contact.number.toString()
        }
    });

    if (!driverRecord) {
        driverRecord = await prisma.driver.create({
            data: {
                name: driver.name,
                contactCode: driver.contact.code,
                contactNumber: driver.contact.number.toString()
            }
        });
    }

    // Update or create the booking
    if (booking) {
        await prisma.booking.update({
            where: { bookingId },
            data: {
                orderRefId,
                status: statusDesc,
                otp,
                cabId: cab.id,
                driverId: driverRecord.id
            }
        });
    } else {
        await prisma.booking.create({
            data: {
                bookingId,
                orderRefId,
                status: statusDesc,
                otp,
                cabId: cab.id,
                driverId: driverRecord.id
            }
        });
    }

    console.info(`Successfully updated cab driver info for booking: ${bookingId}`);
};

const handleTripUpdate = async (eventType: string, data: TripUpdateData) => {
    const { bookingId, orderRefId, bookingStatus, tripdata } = data;

    // Find the booking
    const booking = await prisma.booking.findUnique({
        where: { bookingId },
    });

    if (!booking) {
        console.warn(`Booking not found for trip update: ${bookingId}`);
        return;
    }

    // Prepare update data based on event type
    const updateData: any = {
        status: bookingStatus,
        lastLatitude: tripdata.coordinates.latitude,
        lastLongitude: tripdata.coordinates.longitude,
    };

    // Add specific data based on event type
    if (eventType === 'tripStart' && tripdata.startDate && tripdata.startTime) {
        updateData.tripStartDate = new Date(tripdata.startDate);
        updateData.tripStartTime = tripdata.startTime;
    } else if (['tripEnd', 'noshow', 'arrived', 'leftforpickup'].includes(eventType) &&
        tripdata.endDate && tripdata.endTime) {
        updateData.tripEndDate = new Date(tripdata.endDate);
        updateData.tripEndTime = tripdata.endTime;
    }

    // Create or update the booking
    if (booking) {
        await prisma.booking.update({
            where: { bookingId },
            data: updateData
        });
    } else {
        await prisma.booking.create({
            data: {
                bookingId,
                orderRefId,
                ...updateData
            }
        });
    }

    console.info(`Successfully updated trip status to ${eventType} for booking: ${bookingId}`);
};

const handleTripCancel = async (data: TripCancelData) => {
    const { bookingId, orderRefId, reason, message, cancellationCharge, refundAmount } = data;

    // Find the booking
    const booking = await prisma.booking.findUnique({
        where: { bookingId },
    });

    // Update or create the booking with cancellation details
    if (booking) {
        await prisma.booking.update({
            where: { bookingId },
            data: {
                status: 'Cancelled',
                cancellationReason: reason,
                cancellationMessage: message,
                cancellationCharge,
                refundAmount
            }
        });
    } else {
        await prisma.booking.create({
            data: {
                bookingId,
                orderRefId,
                status: 'Cancelled',
                cancellationReason: reason,
                cancellationMessage: message,
                cancellationCharge,
                refundAmount
            }
        });
    }

    console.info(`Successfully cancelled booking: ${bookingId}`);
};

// Main webhook handler
const handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        const webhookData: WebhookData = req.body;
        console.info(`Received webhook of type: ${webhookData.type}`);

        switch (webhookData.type) {
            case 'cabDriverUpdate':
                await handleCabDriverUpdate(webhookData.data as CabDriverUpdateData);
                break;
            case 'leftforpickup':
            case 'arrived':
            case 'noshow':
            case 'tripStart':
            case 'tripEnd':
            case 'updateLastLocation':
                await handleTripUpdate(webhookData.type, webhookData.data as TripUpdateData);
                break;
            case 'tripCancel':
                await handleTripCancel(webhookData.data as TripCancelData);
                break;
            default:
                console.warn(`Unknown webhook type: ${webhookData.type}`);
                res.status(400).json({ success: false, message: 'Unknown webhook type' });
                return;
        }

        res.status(200).json({ success: true, message: 'Webhook processed successfully' });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ success: false, message: 'Error processing webhook' });
    }
};

// ==================== Router Configuration ====================

const router = Router();

// Apply token validation middleware and controller for the webhook endpoint
router.post('/gozo', validateWebhookToken, handleWebhook);

export default router;

// Export individual components for potential reuse
export { validateWebhookToken, handleWebhook };
