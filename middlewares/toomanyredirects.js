const {StatusCodes} = require('http-status-codes')
const tooManyRedirectsMiddleware = (req, res) => {
    if (StatusCodes.TOO_MANY_REQUESTS) {
        return res.redirect('/login')
    }
}

module.exports = tooManyRedirectsMiddleware