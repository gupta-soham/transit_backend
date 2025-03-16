import { isValidPhoneNumber } from "libphonenumber-js";
import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters long'),
}).refine((data) => data.password === data.confirmPassword,{
    message: "Password do not match",
    path: ["confirmPassword"]
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required').refine(value => {
    return value.includes('@') || isValidPhoneNumber("+91" + value);
  }, {
    message: 'Identifier must be a valid email or phone number',
  }), // Can be email or phone number
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const updateUserSchema = z.object({
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits long')
      .max(15, 'Phone number must be at most 15 digits long')
      .refine(value => isValidPhoneNumber("+91" + value), {
        message: 'Invalid phone number format'
      }),
    dob: z.string().refine(value => !isNaN(Date.parse(value)), {
      message: 'Invalid date format (Use YYYY-MM-DD)'
    }),
    gender: z.enum(['Male', 'Female', 'Other'], {
      message: 'Gender must be Male, Female, or Other'
    }),
  });

export const otpSchema = z.object({
    phoneNumber: z
    .string()
    .refine((val) => isValidPhoneNumber("+91" + val) || isValidPhoneNumber(val), {
        message: "Invalid phone number"
    }),
  otp: z.string().length(6, 'OTP must be 6 digits long'),
});

export const contactSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    country: z.string().optional(),
    industry: z.string().optional(),
    companyName: z.string().optional(),
    companyWebsite: z.string().optional(),
    companyEmail: z.string().email(),
    phone: z.string().optional(),
    message: z.string().min(1),
    interested: z.boolean(),
  });