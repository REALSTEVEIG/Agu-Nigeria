const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const authSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        minlength : [3, ' Username is too short!'],
        maxlength : [30, ' Username is too long!']
    },
      email: {
        type: String,
        required: true,
        match: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        unique: true,
      },
      password: {
        type: String,
        required: true,
        minlength: [3, ' Password is too short!'],
        maxlength : [30, ' Password is too long!']
      },


}, {timestamps: true})

//pre or post save to determine if we want to effect the function before or after saving to the database

authSchema.pre('save', async function () {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

authSchema.methods.getname = function () {
    return this.username
}

authSchema.methods.createJWT = function () {
    return jwt.sign({userId : this._id, username : this.username }, process.env.JWT_SECRET, {expiresIn : process.env.JWT_LIFETIME})
}

authSchema.methods.comparePassword = async function (userPassword) {
    const isMatch = await bcrypt.compare(userPassword, this.password)
    return isMatch
}

module.exports = mongoose.model("Auth", authSchema)