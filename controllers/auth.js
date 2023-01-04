const User = require('../models/auth')
const axios = require("axios");
const options = require('../middlewares/externalapi')
const nodemailer = require('nodemailer')
const passport = require('passport')

exports.registerPage = async (req, res) => {
    const quoteData = await axios.request(options)
   res.render('register', {quote : quoteData.data})
}

exports.registerUser = async (req, res, next) => {
  try {
      const newUser = await User.register(
          {username : req.body.username, email: req.body.email }, req.body.password)

          //Node-mailer session

          let transporter = nodemailer.createTransport({
            service : 'gmail',
            auth : {
                user : process.env.user,
                pass : process.env.pass
            }
        })

          let mailOptions = {
            from : `AGU NIGERIA <${process.env.user}>`, // sender address
            to: `<${req.body.email}>`, // list of receivers   
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
            text :  `A new user just signed up welcome ${req.body.email}`
        };
        
        transporter.sendMail(mailOptions2, (error) => {
            if (error) {
                return console.log(error);
            }
            else {
              console.log('Response sent to your email')
            }
        });

      res.redirect('login');
    } catch (error) {
      console.log(error)
      res.render('register', { error : error.message });
    }
}


exports.loginPage = async (req, res) => {
  const quoteData = await axios.request(options)
   res.render('login', {quote : quoteData.data})
}


exports.loginUser = async (req, res, next) => {
  try {
      await passport.authenticate('local', (err, user, info) => {

        if (err) { 
          return res.render('login', {error : info.message}) 
      }

        if (!user) { 
          return res.render('login', {error : info.message})
       }

        req.logIn(user, (err) => {
          if (err) { 
              return res.render('login', {error : info.message})
          }

      return res.redirect('/product');
        
  })
  })(req, res, next)

    } catch (error) {
      return res.render('login', {error : info.message});
    }
}


exports.logout = (req, res) => {
    req.session.destroy()
    res.clearCookie('session-id')
    res.redirect('/login')
}