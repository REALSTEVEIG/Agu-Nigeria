const jwt = require('jsonwebtoken')
const {StatusCodes} = require('http-status-codes')

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token

    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).redirect('login')
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.username = {userId : payload.userId, username : payload.username}
        next()        
    } catch (error) {
       return res.status(StatusCodes.FORBIDDEN).redirect('login')
    }
   
}
  module.exports = authMiddleware