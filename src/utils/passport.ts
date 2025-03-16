import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../prismaClient'; // Import your Prisma client

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if emails and photos are available
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      const photo = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

      if (!email) {
        return done(new Error('No email found in profile'), false);
      }

      // Check if user already exists in the database
      let user = await prisma.user.findUnique({
        where: { email },
      });

      // If not, create a new user
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: profile.displayName,
            image: photo || '', // Use an empty string if no photo is available
            emailVerified: true, // Automatically verify email
            password: '', // Provide a default or empty password if required
          },
        });
      }

      // Return the user object
      done(null, user);
    } catch (error) {
      console.error('Error during Google authentication:', error);
      done(error, false);
    }
  }
));

// Serialize user to session
passport.serializeUser((user: any, done) => {
  done(null, (user as { id: string }).id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user || undefined);
  } catch (error) {
    done(error, undefined);
  }
});

export default passport;