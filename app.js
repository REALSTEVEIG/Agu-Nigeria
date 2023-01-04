require('dotenv').config()
require('express-async-errors')
require('./config/oauth_google')

let bool
const express = require('express')
const server = express()
const connectDB = require('./db/connect')
const port = process.env.PORT || 3700
const errorhandlermiddleware = require('./middlewares/errorhandler')
const notfoundMiddleware = require('./middlewares/notfound')
const Handlebars = require('handlebars'); // first templating engine
const exphbs = require('express-handlebars'); // second templating engine
const path = require('path')
const authMiddleware = require('./middlewares/authenticated')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const xss = require('xss-clean')
const expressRateLimitter = require('express-rate-limit')
const tooManyRedirectsMiddleware = require('./middlewares/toomanyredirects')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const Auth = require('./models/auth')


// Routes 
const htmlRouter = require('./routes/htmlpages')
const authRouter = require('./routes/auth')


//templating engine express handlebars
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
server.engine('handlebars', exphbs.engine({defaultLayout: 'main', handlebars: allowInsecurePrototypeAccess(Handlebars)})); // ...implement newly added insecure prototype access
server.set('view engine', 'handlebars');

//allows us to access the public folder for js and css
server.use('/public', express.static(path.join(__dirname, 'public')))
server.use(express.static("uploads"));

// parse user input in json format
server.use(express.json())
server.use(express.urlencoded({extended: false}))

//security
server.set('trust proxy', 1)
server.use(cors())
server.use(function(req, res, next) {
  res.header("Content-Security-Policy", "script-src 'self' kit.fontawesome.com ipt leostop.com checkout.paystack.com");
  next();
});

server.use(xss())
server.use(expressRateLimitter({windowsMs : 60 * 1000, max : 60}))

//use the cookie parser middleware
server.use(cookieParser())

//express-session setup with mongostrore to store sessions in our database

if (process.env.NODE_ENV === 'development') {
    bool = false
}
else {
  bool = true
}

server.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {     
        maxAge: 300000, // 5 minutes in milliseconds
        httpOnly: true,
        secure : bool // set to true in production false on localhost
    }
  }))
  
  //passport initialize
  server.use(passport.initialize())
  server.use(passport.session())
  
  //setup passport
  passport.use(Auth.createStrategy());
  passport.serializeUser(Auth.serializeUser());
  passport.deserializeUser(Auth.deserializeUser());
  
  //signup with google
  server.get('/auth/google',
    passport.authenticate('google', { scope: ["email", "profile"] }));
  
  server.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect to dashboard.
      res.redirect('/product');
    });

//route functions
server.use('/', authRouter)
server.use('/', authMiddleware, htmlRouter)

//error handlers
server.use(errorhandlermiddleware)
server.use(tooManyRedirectsMiddleware)
server.use(notfoundMiddleware)

//function to check database connection and start server
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        server.listen(port, () => {
            console.log(`Server is listening on port ${port}`)
        })
    } catch (error) {
        console.log(error)
    }
}

start()