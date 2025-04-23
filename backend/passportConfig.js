const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { findUserByEmail, registerUser, findUserById } = require('./models/userModel'); // Added findUserById

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:5000/api/auth/google/callback', // The same URI you set on Google Developer Console
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if the user already exists by email
    let user = await findUserByEmail(profile.emails[0].value);
    if (!user) {
      // Register new user with dummy password
      await registerUser(profile.displayName, profile.emails[0].value, 'google-password');
      user = await findUserByEmail(profile.emails[0].value);
    }
    done(null, user); // Authentication complete
  } catch (err) {
    done(err);
  }
}));

// Serialize only the user's ID into session
passport.serializeUser((user, done) => done(null, user.id));

// Deserialize user by looking up the user by ID
passport.deserializeUser((id, done) => {
  findUserById(id)
    .then(user => done(null, user))
    .catch(err => done(err));
});
