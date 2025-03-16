import { NextFunction, Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { sendVerificationEmail } from '../utils/emailService';
import { sendResetEmail as sendResetEmailUtil } from '../utils/emailService';
import { sendOtp } from '../utils/otpService';
import { generateToken, verifyToken } from '../utils/jwtService';
import { registerSchema, loginSchema, updateUserSchema, contactSchema} from '../validations/authValidation';
import { addHours, isAfter } from 'date-fns'; 
import { JwtPayload } from 'jsonwebtoken';
import jwt from "jsonwebtoken";
import AppError from '../utils/AppError';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);


//Register new user
export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      
      const validatedData = registerSchema.parse(req.body);
      
      const { firstName, lastName, email, password, confirmPassword } = validatedData;

      if (password !== confirmPassword) {
        return next(new AppError('Passwords do not match', 400));
      }

      // Check if the email already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return next(new AppError('Email already exists', 400));
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create user in the database
      const user = await prisma.user.create({
        data: {
          email,
          name: `${firstName} ${lastName}`,
          password: hashedPassword,
          emailVerified: false, // Set to false initially
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
  
      // Generate a verification token
      const verificationToken = generateToken(user.id);
  
      // Send verification email
      console.log('Sending verification email to:', email);
      await sendVerificationEmail(email, verificationToken);
  
  
      return res.status(201).json({ message: 'User registered successfully. Please verify your email.', user });
    } catch (error) {
      console.error('Registration error:', error); // Log the error for debugging
  
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') { // Unique constraint violation
          return next(new AppError('Email or phone number already exists', 400));
        }
      }
  
      if (error instanceof AppError) {
        return next(error);
      }
      return next(new AppError('An error occurred during registration', 500));
    }
  };


//verify the email via token 
  export const verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.query;
  
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
  
    try {
      // Verify the token and assert the type
      const decoded = verifyToken(token as string) as JwtPayload;
  
      // Update user to set email as verified
      await prisma.user.update({
        where: { id: (decoded as JwtPayload).id }, // Use the ID from the decoded token
        data: { emailVerified: true },
      });
  
      return res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
      console.error('Error during email verification:', error);
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
  };


  
//loged in
export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = loginSchema.parse(req.body);

    // Find user by email or phone number
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phoneNumber: identifier },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if email or phone number is verified
    if (!user.emailVerified ) {
      return res.status(403).json({ error: 'Email is verified' });
    }


    // Generate JWT token
    const token = generateToken(user.id);

    return res.status(200).json({ message: 'Login successful', token });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Login failed' });
  }
};


//after user logedIn add more details
export const updateUserDetails = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as { id: string }).id;
    
    // Validate request body
    const validatedData = updateUserSchema.parse(req.body);

    const { phoneNumber, dob, gender } = validatedData;

    // Check if phone number is already in use
    const existingUser = await prisma.user.findUnique({ where: { phoneNumber } });
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ message: "Phone number is already registered with another account" });
    }

    // Update user details
    await prisma.user.update({
      where: { id: userId },
      data: { phoneNumber, dob: new Date(dob), gender, phoneNumberVerified: false },
    });

    // Send OTP for phone verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await sendOtp(phoneNumber, otp);

    // Save OTP to database (expires in 10 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await prisma.otp.create({ data: { phoneNumber, otp, expiresAt } });

    res.json({ message: "User details updated. OTP sent to phone", phoneNumber });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error updating user details:', error.message); // Log only the error message
    } else {
      console.error('Unexpected error:', error);
    }
    res.status(500).json({ message: "Error updating user details" });
  }
};

//send otp to phone number
export const sendOtpToPhone = async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    await sendOtp(phoneNumber, otp); // Send OTP using fast2sms

    // Save OTP to the database with an expiration time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes

    await prisma.otp.create({
      data: {
        phoneNumber,
        otp,
        expiresAt,
      },
    });

    console.log(`OTP ${otp} sent to phone number ${phoneNumber}`);
    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
    const { phoneNumber, otp } = req.body;
  
    // Find the OTP record
    const otpRecord = await prisma.otp.findFirst({
      where: {
        phoneNumber,
        otp,
      },
    });
  
    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
  
    // Check if the OTP has expired
    if (isAfter(new Date(), otpRecord.expiresAt)) {
      return res.status(400).json({ error: 'OTP has expired' });
    }
  
    // If valid, update the user's phone number verification status
    await prisma.user.update({
      where: { phoneNumber },
      data: { phoneNumberVerified: true },
    });
  
    // Optionally, delete the OTP record after successful verification
    await prisma.otp.delete({
      where: { id: otpRecord.id },
    });
  
    return res.status(200).json({ message: 'Phone number verified successfully' });
  };



  export const sendResetEmailController = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
  
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return next(new AppError('User not found', 404));
      }
  
      // Generate a reset token and set expiration time
      const resetToken = generateToken(user.id); // You can also use a random string
      const expiresAt = addHours(new Date(), 1); // Token expires in 1 hour
  
      // Update user with reset token and expiration
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiresAt: expiresAt,
        },
      });
  
      // Send reset email
      const tokenUrl = generateToken(user.id)
      await sendResetEmailUtil(email, tokenUrl);
  
      return res.status(200).json({ message: 'Reset email sent successfully' });
    } catch (error) {
      console.error('Error sending reset email:', error);
      return next(new AppError('An error occurred while sending reset email', 500));
    }
  };



  export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { token, newPassword } = req.body;
  
    try {
      // Find user by reset token
      const user = await prisma.user.findFirst({
        where: { resetToken: token },
      });
  
      if (!user || !user.resetTokenExpiresAt || new Date() > user.resetTokenExpiresAt) {
        return next(new AppError('Invalid or expired reset token', 400));
      }
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      // Update user password and clear reset token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiresAt: null,
        },
      });
  
      return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Error resetting password:', error);
      return next(new AppError('An error occurred while resetting the password', 500));
    }
  };


//generate token while register as google auth
export const googleauth = async(req: Request, res: Response)=>{

    if (!req.user) {
        return res.status(401).json({ message: "Google authentication failed" });
    }
     // Generate a JWT token for the authenticated user
     const token = jwt.sign(
        { id: (req.user as any).id, email: (req.user as any).email },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" } // Token valid for 7 days
      );
  
      // Send token back to the frontend
      console.log(token);
      res.redirect(`${process.env.FRONTEND_APP_URL}/auth-success?token=${token}`);
}

