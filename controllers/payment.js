//const request = require('request')
//const {initializePayment, verifyPayment} = require('../config/paystack')(request);

// Require the library
var paystack = require('paystack')('Bearer sk_live_094d37b48cf3593c69d14f69644e7a0a9e764cfe');

exports.payment = async (req, res) => {
    paystack.plan.get(1)
    .then(function(error, body) {
        console.log(error);
        console.log(body);
    });

    paystack.transactions({perPage: 1})
    .then(function(error, body) {
        console.log(error);
        console.log(body);
    });
}