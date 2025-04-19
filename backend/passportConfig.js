const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { findUserByEmail, registerUser } = require('./models/userModel'); // Use your user model

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:5000/api/auth/google/callback', // The same URI you set on Google Developer Console
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if the user already exists
    let user = await findUserByEmail(profile.emails[0].value);
    if (!user) {
      // Register the user if not found
      await registerUser(profile.displayName, profile.emails[0].value, 'google-password'); // You can set a dummy password for Google sign-ins
      user = await findUserByEmail(profile.emails[0].value); // Fetch the newly registered user
    }
    done(null, user); // Proceed with authenticated user
  } catch (err) {
    done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  findUserByEmail(id)
    .then(user => done(null, user))
    .catch(err => done(err));
});
