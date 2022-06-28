const express = require('express')
const router = express.Router()
const {registerPage, registerUser, loginPage, loginUser, logout} = require('../controllers/auth')

router.route('/').get(registerPage)
router.route('/').post(registerUser)
router.route('/login').get(loginPage)
router.route('/login').post(loginUser)
router.route('/logout').get(logout)  //redirect to the landing page

module.exports = router

