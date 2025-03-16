import { Router, RequestHandler } from 'express';
import { getProfile, updateProfile } from '../../controllers/auth_private';
import { authenticate } from '../../middlewares/authMiddleware';
const userRoutes = Router();


//authenticate user routes
//get user details
userRoutes.get('/profile/details',authenticate, getProfile as unknown as RequestHandler );
userRoutes.put('/profile/update',authenticate, updateProfile as unknown as RequestHandler );


export default userRoutes;