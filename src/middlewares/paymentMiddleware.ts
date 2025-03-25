import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

interface ValidationOptions {
    body?: ZodSchema;
    params?: ZodSchema;
    query?: ZodSchema;
}

export const validateRequest = (schemas: ValidationOptions) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schemas.body) {
                schemas.body.parse(req.body);
            }
            if (schemas.params) {
                schemas.params.parse(req.params);
            }
            if (schemas.query) {
                schemas.query.parse(req.query);
            }
            next();
        } catch (error) {
            res.status(400).json({
                error: 'Validation Failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
};