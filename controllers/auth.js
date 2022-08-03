const Auth = require('../models/auth')
const {StatusCodes} = require('http-status-codes')

exports.registerPage = async (req, res) => {
  const axios = require("axios");
  const options = {
    method: 'POST',
    url: 'https://motivational-quotes1.p.rapidapi.com/motivation',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': '092ca3a70bmsh05815545f73544bp144e8fjsn3f85ab4e267e',
      'X-RapidAPI-Host': 'motivational-quotes1.p.rapidapi.com'
    },
    data: '{"key1":"value","key2":"value"}'
  };

  const quoteData = await axios.request(options)

 res.render('register', {quote : quoteData.data})
}

exports.registerUser = async (req, res) => {
  const {username, email, password} = req.body

  if (!username || !email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).render('register', {msg : `Please provide all the required credentials!`})
  } 

  const suppliedEmail = await Auth.findOne({email})

  const suppliedUsername = await Auth.findOne({username})

  if (suppliedEmail && suppliedUsername) {
    return res.status(StatusCodes.BAD_REQUEST).render('register', {msg : `The email and username you supplied already exists in our database. Please provide a different one`})
  }

  if (suppliedEmail) {
    return res.status(StatusCodes.BAD_REQUEST).render('register', {msg : `${req.body.email} already exists in our database. Please provide a different email.`})
  }

  if (suppliedUsername) {
    return res.status(StatusCodes.BAD_REQUEST).render('register', {msg : `${req.body.username} already exists in our database. Please provide a different username.`})
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
  const axios = require("axios");
  const options = {
    method: 'POST',
    url: 'https://motivational-quotes1.p.rapidapi.com/motivation',
    headers: {
      'content-type': 'application/json',
      'X-RapidAPI-Key': '092ca3a70bmsh05815545f73544bp144e8fjsn3f85ab4e267e',
      'X-RapidAPI-Host': 'motivational-quotes1.p.rapidapi.com'
    },
    data: '{"key1":"value","key2":"value"}'
  };

  const quoteData = await axios.request(options)
 res.render('login', {quote : quoteData.data})
}

exports.loginUser = async (req, res) => {

  const {email, password} = req.body

  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).render('login', {msg : `Please provide all the required credentials!`})
  }
 
  const user = await Auth.findOne({email})

  if (!user) {
    return res.status(StatusCodes.UNAUTHORIZED).render('login', {msg : `Email does not exist!`})
  }

  const isPasswordCorrect = await user.comparePassword(password)

  if (!isPasswordCorrect) {
    return res.status(StatusCodes.UNAUTHORIZED).render('login', {msg : `Password is incorrect!`})
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
