const {StatusCodes} = require('http-status-codes')
const notfoundMiddleware = (req, res) => {
    return res.status(StatusCodes.NOT_FOUND).redirect('/login')
}

module.exports = notfoundMiddleware