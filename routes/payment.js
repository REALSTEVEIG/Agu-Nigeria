const express = require('express')

const {payment} = require('../controllers/payment')

const router = express.Router()

router.route('/paystack/pay').get(payment)

module.exports = router