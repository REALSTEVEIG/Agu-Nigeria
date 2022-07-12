const mongoose = require('mongoose')

 const productsSchema = mongoose.Schema({
    name : {
        type : String,
    },
    price : {
        type : Number,
    },
    image : {
        type : String,
    }
})
 module.exports = mongoose.model("Products", productsSchema)