

//REGISTER NEW USER

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user with email, password, and name.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Test@1234
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: Test@1234
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */



// //VERIFY EMAIL

//     /**
//      * @swagger
//      * /api/auth/verify-email:
//      *   get:
//      *     summary: Verify user email
//      *     description: Verifies a user's email using a token sent via email.
//      *     tags: [Auth]
//      *     parameters:
//      *       - in: query
//      *         name: token
//      *         required: true
//      *         schema:
//      *           type: string
//      *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
//      *         description: JWT token received via email for verification
//      *     responses:
//      *       200:
//      *         description: Email verified successfully
//      *         content:
//      *           application/json:
//      *             schema:
//      *               type: object
//      *               properties:
//      *                 message:
//      *                   type: string
//      *                   example: "Email verified successfully. You can now log in."
//      *       400:
//      *         description: Invalid or expired token
//      *       500:
//      *         description: Server error
//      */

// RESEND EMAIL VERIFICATION

/**
 * @swagger
 * /api/auth/resend-email:
 *   post:
 *     summary: Resend the verification email to a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Verification email sent successfully
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email is required
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred while sending verification email
 */

//LOGIN BY EMAIL OR PHONE NUMBER

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user with email or phone number and password.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *                 example: "john.doe@example.com"
 *                 description: User's email or phone number.
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Test@1234"
 *                 description: User's password.
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   example: "your-jwt-token"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid credentials"
 *       403:
 *         description: Email not verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email is not verified"
 *       400:
 *         description: Bad request (Validation errors)
 */

//ADD MORE DETAILS

/**
 * @swagger
 * /api/auth/addDetails:
 *   put:
 *     summary: Update user details after login
 *     description: Allows logged-in users to update their phone number, date of birth, and gender.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "9876543210"
 *                 description: User's phone number (must be unique).
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1995-08-20"
 *                 description: Date of birth (YYYY-MM-DD format).
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *                 example: "Male"
 *                 description: User's gender.
 *     responses:
 *       200:
 *         description: User details updated, OTP sent to phone
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User details updated. OTP sent to phone"
 *                 phoneNumber:
 *                   type: string
 *                   example: "9876543210"
 *       400:
 *         description: Bad request (Validation errors or phone number already in use)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Phone number is already registered with another account"
 *       500:
 *         description: Internal server error
 */


//VERIFY OTP

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP for phone number
 *     description: Verifies the OTP sent to the user's phone number and marks the phone as verified.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "9876543210"
 *                 description: The phone number that received the OTP.
 *               otp:
 *                 type: string
 *                 example: "123456"
 *                 description: The 6-digit OTP code.
 *     responses:
 *       200:
 *         description: Phone number verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Phone number verified successfully"
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid OTP"
 *       500:
 *         description: Server error
 */


//REQUEST RESET EMAIL PASSWORD

/**
 * @swagger
 * /api/auth/request-reset:
 *   post:
 *     summary: Request password reset email
 *     description: Sends a password reset email to the user with a reset token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *                 description: The email of the user requesting a password reset.
 *     responses:
 *       200:
 *         description: Reset email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reset email sent successfully"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error
 */

// RESET PASSWORD

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Allows users to reset their password using a reset token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "your-reset-token"
 *                 description: The reset token received via email.
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "NewSecurePassword123!"
 *                 description: The new password for the account.
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset successfully"
 *       400:
 *         description: Invalid or expired reset token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or expired reset token"
 *       500:
 *         description: Server error
 */


//GOOGLE AUTH

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Start Google authentication
 *     description: Redirects the user to Google's OAuth 2.0 authentication page.
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to Google authentication page.
 */

//GET PROFILE DETAILS

/**
 * @swagger
 * /api/user/profile/details:
 *   get:
 *     summary: Get user profile details
 *     description: Retrieves the authenticated user's profile information.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "abc123"
 *                 email:
 *                   type: string
 *                   example: "john.doe@example.com"
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 image:
 *                   type: string
 *                   example: "https://example.com/profile.jpg"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-03-15T12:34:56Z"
 *                 phoneNumber:
 *                   type: string
 *                   example: "9876543210"
 *                 gender:
 *                   type: string
 *                   example: "Male"
 *                 dob:
 *                   type: string
 *                   format: date
 *                   example: "1995-08-20"
 *       401:
 *         description: Unauthorized (Invalid or missing token)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

//UPDATE USER PROFILE DETAILS

/**
 * @swagger
 * /api/user/profile/update:
 *   put:
 *     summary: Update user profile
 *     description: Allows an authenticated user to update their profile details such as name, DOB, gender, and image.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *                 description: Updated full name of the user.
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: "1995-08-20"
 *                 description: Updated date of birth in YYYY-MM-DD format.
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *                 example: "Male"
 *                 description: Updated gender of the user.
 *               image:
 *                 type: string
 *                 example: "https://example.com/profile.jpg"
 *                 description: Updated profile picture URL.
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "abc123"
 *                 email:
 *                   type: string
 *                   example: "john.doe@example.com"
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 image:
 *                   type: string
 *                   example: "https://example.com/profile.jpg"
 *                 dob:
 *                   type: string
 *                   format: date
 *                   example: "1995-08-20"
 *                 gender:
 *                   type: string
 *                   example: "Male"
 *       400:
 *         description: Bad request (Validation errors)
 *       401:
 *         description: Unauthorized (Invalid or missing token)
 *       500:
 *         description: Server error
 */


//Logout 

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout the authenticated user
 *     description: Clears authentication cookies and deletes the session from the database.
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logged out successfully"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Logout failed"
 */

/**
 * @swagger
 * /api/auth/current_user:
 *   get:
 *     summary: Get current authenticated user
 *     description: Returns details of the currently authenticated user.
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "12345"
 *                 email:
 *                   type: string
 *                   example: "user@example.com"
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 emailVerified:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Not authenticated"
 */

/**
 * @swagger
 * /api/auth/resend-email:
 *   post:
 *     summary: Resend email verification
 *     description: Sends a new email verification link to the user.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Verification email sent successfully"
 *       400:
 *         description: Bad request (missing email or email already verified)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email is required"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while sending verification email"
 */


////cab routes

/**
 * @swagger
 * /api/cab/getQuote:
 *   post:
 *     summary: Get a trip quote
 *     description: Fetches a fare estimate for a trip based on trip type, cab type, and route details.
 *     tags: [Cab Booking]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tripType:
 *                 type: integer
 *                 enum: [1, 2, 3, 4, 9, 10, 11]
 *                 description: Trip type code (1=One Way, 2=Round Trip, 3=Multi City, 4=Airport Transfer, etc.)
 *                 example: 1
 *               cabType:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Allowed cab models (e.g., 1=Compact, 2=SUV, 3=Sedan, etc.)
 *                 example: [1, 2, 3]
 *               routes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     startDate:
 *                       type: string
 *                       format: date
 *                       example: "2024-03-21"
 *                     startTime:
 *                       type: string
 *                       format: time
 *                       example: "01:35:00"
 *                     source:
 *                       type: object
 *                       properties:
 *                         address:
 *                           type: string
 *                           example: "NSC Bose Airport"
 *                         name:
 *                           type: string
 *                           example: "Netaji Subhas Chandra Bose International Airport (CCU), Kolkata"
 *                         coordinates:
 *                           type: object
 *                           properties:
 *                             latitude:
 *                               type: number
 *                               example: 22.6531496
 *                             longitude:
 *                               type: number
 *                               example: 88.4448719
 *                     destination:
 *                       type: object
 *                       properties:
 *                         address:
 *                           type: string
 *                           example: "Sodepur Traffic More, Kolkata"
 *                         name:
 *                           type: string
 *                           example: "Khardaha"
 *                         coordinates:
 *                           type: object
 *                           properties:
 *                             latitude:
 *                               type: number
 *                               example: 22.7008099
 *                             longitude:
 *                               type: number
 *                               example: 88.3747597
 *     responses:
 *       200:
 *         description: Successfully retrieved trip quote
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     startDate:
 *                       type: string
 *                       example: "2024-03-21"
 *                     startTime:
 *                       type: string
 *                       example: "06:01:00"
 *                     quotedDistance:
 *                       type: integer
 *                       example: 335
 *                     estimatedDuration:
 *                       type: integer
 *                       example: 360
 *                     cabRate:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           cab:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 1
 *                               type:
 *                                 type: string
 *                                 example: "Compact (Value)"
 *                               model:
 *                                 type: string
 *                                 example: "Indica, Swift, Alto, Ford Figo or equivalent"
 *                               seatingCapacity:
 *                                 type: integer
 *                                 example: 4
 *                           fare:
 *                             type: object
 *                             properties:
 *                               baseFare:
 *                                 type: number
 *                                 example: 4366
 *                               totalAmount:
 *                                 type: number
 *                                 example: 4584
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Validation failed"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       path:
 *                         type: string
 *                         example: "routes.0.source.coordinates.latitude"
 *                       message:
 *                         type: string
 *                         example: "Latitude must be a number"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch trip quote"
 */





