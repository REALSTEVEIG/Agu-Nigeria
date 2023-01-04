const User = require('../models/auth')
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.callbackURL
  }, async (request, accessToken, refreshToken, profile, done) => {
    try {
        console.log(profile)
        let existingUser = await User.findOne({ 'id': profile.id });

        if (existingUser) {
            return done(null, existingUser);
        }
 
        console.log('Creating new user...');
        const newUser = new User({
            method: 'google',
            id: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            picture : profile.photos[0].value
        });
        await newUser.save();
        return done(null, newUser);
    } catch (error) {
        return done(error, false)
    }
}
));