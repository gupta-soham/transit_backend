import { z } from 'zod';

// Define trip types
export enum TripType {
    ONE_WAY = 1,
    ROUND_TRIP = 2,
    MULTI_CITY = 3,
    AIRPORT_TRANSFER = 4,
    DAY_RENTAL_4HR_40KM = 9, // DEPRECATED
    DAY_RENTAL_8HR_80KM = 10,
    DAY_RENTAL_12HR_120KM = 11
}

// Define cab types
export enum CabType {
    COMPACT = 1,
    SUV = 2,
    SEDAN = 3,
    ASSURED_DZIRE = 5,
    ASSURED_INNOVA = 6,
    COMPACT_CNG = 72,
    SEDAN_CNG = 73,
    SUV_CNG = 74
}

// Zod schemas for getQuote
export const CoordinatesSchema = z.object({
    latitude: z.number(),
    longitude: z.number()
});

export const LocationSchema = z.object({
    address: z.string(),
    name: z.string().optional(),
    coordinates: CoordinatesSchema
});

export const RouteSchema = z.object({
    startDate: z.string(),
    startTime: z.string(),
    source: LocationSchema,
    destination: LocationSchema
});

export const TripRequestSchema = z.object({
    tripType: z.nativeEnum(TripType),
    cabType: z.array(z.nativeEnum(CabType)).min(1),
    routes: z.array(RouteSchema).min(1)
});

// Zod schemas for booking
export const FareSchema = z.object({
    advanceReceived: z.number(),
    totalAmount: z.number()
});

export const PlatformSchema = z.object({
    deviceName: z.string().optional(),
    ip: z.string().optional(),
    type: z.string().optional()
}).optional();

export const ContactSchema = z.object({
    code: z.number(),
    number: z.string()
});

export const TravellerSchema = z.object({
    firstName: z.string(),
    lastName: z.string().optional(),
    primaryContact: ContactSchema,
    alternateContact: ContactSchema.optional(),
    email: z.string().email(),
    companyName: z.string().optional(),
    address: z.string().optional(),
    gstin: z.string().optional()
});

export const AdditionalInfoSchema = z.object({
    specialInstructions: z.string().optional(),
    noOfPerson: z.number().optional(),
    noOfLargeBags: z.number().optional(),
    noOfSmallBags: z.number().optional(),
    carrierRequired: z.number().optional(),
    kidsTravelling: z.number().optional(),
    seniorCitizenTravelling: z.number().optional(),
    womanTravelling: z.number().optional()
}).optional();

export const BookingRequestSchema = z.object({
    tnc: z.number(),
    referenceId: z.string(),
    tripType: z.nativeEnum(TripType),
    cabType: z.nativeEnum(CabType),
    fare: FareSchema,
    platform: PlatformSchema,
    apkVersion: z.string().optional(),
    sendEmail: z.number(),
    sendSms: z.number(),
    routes: z.array(RouteSchema).min(1),
    traveller: TravellerSchema,
    additionalInfo: AdditionalInfoSchema
});

export const BookingIdSchema = z.object({
    bookingId: z.string().min(1, "Booking ID is required")
});

export const UpdateBookingSchema = z.object({
    bookingId: z.string().min(1, "Booking ID is required"),
    amountPaid: z.string().optional(),
    traveller: z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        primaryContact: ContactSchema.optional(),
        alternateContact: ContactSchema.optional(),
        email: z.string().email().optional()
    }).optional(),
    additionalInfo: z.object({
        specialInstructions: z.string().optional(),
        noOfPerson: z.number().optional(),
        noOfLargeBags: z.number().optional(),
        noOfSmallBags: z.number().optional(),
        carrierRequired: z.number().min(0).max(1).optional(),
        kidsTravelling: z.number().min(0).max(1).optional(),
        seniorCitizenTravelling: z.number().min(0).max(1).optional(),
        womanTravelling: z.number().min(0).max(1).optional()
    }).optional()
});

export const CancelBookingSchema = z.object({
    bookingId: z.string().min(1, "Booking ID is required"),
    reason: z.string().min(1, "Cancellation reason is required"),
    reasonId: z.string()
});


// Type inference from schemas
export type Coordinates = z.infer<typeof CoordinatesSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Route = z.infer<typeof RouteSchema>;
export type TripRequest = z.infer<typeof TripRequestSchema>;
export type Fare = z.infer<typeof FareSchema>;
export type Platform = z.infer<typeof PlatformSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type Traveller = z.infer<typeof TravellerSchema>;
export type AdditionalInfo = z.infer<typeof AdditionalInfoSchema>;
export type BookingRequest = z.infer<typeof BookingRequestSchema>;
export type BookingIdRequest = z.infer<typeof BookingIdSchema>;
export type UpdateBookingRequest = z.infer<typeof UpdateBookingSchema>;
export type CancelBookingRequest = z.infer<typeof CancelBookingSchema>;
