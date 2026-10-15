const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const callbackURL =
  process.env.GOOGLE_CALLBACK_URL ||
  'http://localhost:5000/auth/google/callback';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        const email =
          profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        if (email) {
          user = await User.findOne({ email });
          if (user) {
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
          }
        }

        let username =
          profile.displayName ||
          (email ? email.split('@')[0] : `user_${profile.id}`);

        const taken = await User.findOne({ username });
        if (taken) username = `${username}_${Math.floor(Math.random() * 10000)}`;

        user = await User.create({
          googleId: profile.id,
          username,
          email,
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
