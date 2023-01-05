let callback;
const User = require('../models/auth');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const nodemailer = require('nodemailer')

if (process.env.NODE_ENV === 'development') {
    callback = process.env.callbackURL_LOCAL
}
else {
    callback = process.env.callbackURL_PROD
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callback
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

        //SETTING UP NODEMAILER SO AS TO MAIL NEW SIGNUPS
        let transporter = nodemailer.createTransport({
            service : 'gmail',
            auth : {
                user : process.env.user,
                pass : process.env.pass
            }
        })

          let mailOptions = {
            from : `AGU NIGERIA <${process.env.user}>`, // sender address
            to: `<${profile.emails[0].value}>`, // list of receivers   
            subject : 'GREETINGS', // Subject line
            text : `We would like to appreciate you for joining the biggest e-commerce family in West Africa!
                    We wish you greater stride as you move with us through this audacious journey`     
        }
        
        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.log(error)
            }
            else {
              console.log('Welcome message sent to new user')
            }
        });
        
        let mailOptions2 = {        // This will send the mail to your email address
            from : `AGU NIGERIA <${process.env.user}>`, // sender address
            to: `<${process.env.user}>`, // list of receivers
            subject: `NEW USER!`, // Subject line
            text :  `A new user just signed up welcome ${profile.emails[0].value}`
        };
        
        transporter.sendMail(mailOptions2, (error) => {
            if (error) {
                return console.log(error);
            }
            else {
              console.log('Response sent to your email')
            }
        });

        //END OF NODE MAILER

        return done(null, newUser);
    } catch (error) {
        return done(error, false)
    }
}
));