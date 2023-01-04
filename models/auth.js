const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new mongoose.Schema({
    id : {
      type : String
    },
    username: {
      type: String,
      required : [true, 'Please provide your username!'],
      minlength: [3, 'Username is too short!']
    },
    email: {
        type: String,
      },
    picture : {
      type : String
    }
  });

userSchema.plugin(passportLocalMongoose, {
    usernameField: 'email',
    validator: function(password) {
        return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
      },
    errorMessages: {
        saltlen : 10, //length of salt
        UserExistsError: 'The email you provided is already in use...',
        IncorrectPasswordError : 'Incorrect Password...',
        IncorrectUsernameError : 'Email does not exist...',
        MissingUsernameError: 'Please provide your email...',
        ValidatorError: 'Your password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number...',
        MissingPasswordError: 'Please enter your password...'
      },
      limitAttempts : true,
      maxAttempts : 5,
      unlockInterval : 20000, //perios in which a locked accound is deactivated. 20 seconds here.
    })

module.exports = mongoose.model('User', userSchema)