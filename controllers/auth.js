const Auth = require('../models/auth')
const {StatusCodes} = require('http-status-codes')
const axios = require("axios");
const options = require('../middlewares/externalapi')

exports.registerPage = async (req, res) => {
    const quoteData = await axios.request(options)
   res.render('register', {quote : quoteData.data})
}

exports.registerUser = async (req, res) => {
  const quoteData = await axios.request(options)

  const {username, email, password} = req.body

  if (!username || !email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).render('register', {msg : `Please provide all the required credentials!`, quote : quoteData.data})
  } 

  const suppliedEmail = await Auth.findOne({email})

  const suppliedUsername = await Auth.findOne({username})

  if (suppliedEmail && suppliedUsername) {
    return res.status(StatusCodes.BAD_REQUEST).render('register', {msg : `The email and username you supplied already exists in our database. Please provide a different one`, quote : quoteData.data})
  }

  if (suppliedEmail) {
    return res.status(StatusCodes.BAD_REQUEST).render('register', {msg : `${req.body.email} already exists in our database. Please provide a different email.`, quote : quoteData.data})
  }

  if (suppliedUsername) {
    return res.status(StatusCodes.BAD_REQUEST).render('register', {msg : `${req.body.username} already exists in our database. Please provide a different username.`, quote : quoteData.data})
  }

  const newUser = await Auth.create({
    username : req.body.username,
    email : req.body.email,
    password : req.body.password
  })
  const token = newUser.createJWT()

  if (newUser) {
    res.cookie('token', token, {
      secure: true, // set to true if you're using https
      httpOnly: true,
    })
    return res.status(StatusCodes.CREATED).redirect('login')
   } 
}

exports.loginPage = async (req, res) => {
  const quoteData = await axios.request(options)
   res.render('login', {quote : quoteData.data})
}

exports.loginUser = async (req, res) => {

  const quoteData = await axios.request(options)

  const {email, password} = req.body

  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).render('login', {msg : `Please provide all the required credentials!`, quote : quoteData.data})
  }
 
  const user = await Auth.findOne({email})

  if (!user) {
    return res.status(StatusCodes.UNAUTHORIZED).render('login', {msg : `Email does not exist!`, quote : quoteData.data})
  }

  const isPasswordCorrect = await user.comparePassword(password)

  if (!isPasswordCorrect) {
    return res.status(StatusCodes.UNAUTHORIZED).render('login', {msg : `Password is incorrect!`, quote : quoteData.data})
  }

  const token = user.createJWT()
  res.cookie('token', token, {
    secure: true, // set to true if you're using https
    httpOnly: true,
  })
  return res.status(StatusCodes.OK).redirect('index')
}

exports.logout = async (req, res) => {
  await res.clearCookie('token')
  return res.status(StatusCodes.OK).redirect('login')
}
