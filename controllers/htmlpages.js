require('dotenv').config()
const jwt = require('jsonwebtoken')
const Contact = require('../models/contact')
const Newsletter = require('../models/newsletter')
const Products = require('../models/products')  //database 
const nodemailer = require('nodemailer')
const {StatusCodes} = require('http-status-codes')
const {isArray, isEmpty} = require('lodash') //array methods in lodash
const logger = require('../logger/logger')
const request = require('request');
const {initializePayment, verifyPayment} = require('../config/paystack')(request) //Paystack

exports.index = async (req, res) => {
    const token = req.cookies.token
    const products = await Products.find({})
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        return res.render('index', {name : payload.username, products, layout : 'landing'})
    } catch (error) {
       console.log(error)
       return res.status(StatusCodes.INTERNAL_SERVER_ERROR).render('index')
    }
    
}

exports.indexNewsletter = async (req, res) => {
    const { email } = req.body

    if (!email) {
        const token = req.cookies.token
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        return res.status(StatusCodes.BAD_REQUEST).render('index', {msg1 : `Please provide your email address!`, name : payload.username})
    }

    const user = await Newsletter.findOne({email})

    if (user) {
        const token = req.cookies.token
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        return res.status(StatusCodes.BAD_REQUEST).render('index', {msg1 : `This email has already subscribed to our newsletter!`, name : payload.username})
    } 

    const output = `
        <h1>You have a new newsletter request</h1>
        <h3>Contact Details</h3>
        <ul>
            <li>Email : ${req.body.email}</li>
        </ul>
    `

   const data =  Newsletter.create({email}) //this will send the client's email to my database for future refrences

    let transporter = nodemailer.createTransport({
        service : 'gmail',
        auth : {
            user : process.env.user,
            pass : process.env.pass
        }
    })

    let mailOptions = {
        from : `AGU NIGERIA <${process.env.user}>`, // sender address
        to: `<${req.body.email}>`, // list of receivers   
        subject : 'Newsletter', // Subject line
        text : `Thank you for subscribing to our newsletter at Agu Nigeria. Henceforth you will be the first to receive updates on all our newest collections and jaw dropping mega deals!`     
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        const token = req.cookies.token
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        return res.render('index', {msg:'Congratulations your email is now subscribed for our newsletters and product discounts!', name : payload.username});
    });

    let mailOptions2 = {        // This will send the mail to your email address
        from : `AGU NIGERIA <${process.env.user}>`, // sender address
        to: `<${process.env.user}>`, // list of receivers
        subject: `Message from a new subscriber!`, // Subject line
        html: output // html body
    };

    transporter.sendMail(mailOptions2, (error, info) => {
        if (error) {
            return console.log(error);
        }
       return console.log('Sent')
    });

}

exports.about = (req, res) => {
    res.render('about', {layout : 'pages'})
}

exports.contact = (req, res) => {
    res.render('contact', {layout : 'pages'})
}

exports.contactSend = (req, res) => {
    const {name, email, message} = req.body
    
    if (!name || !email || !message) {
        return res.status(StatusCodes.BAD_REQUEST).render('contact', {msg1 : `Please provide all the required parameters!`})
    } 

    const output = `
        <h1>You have a new contact request</h1>
        <h3>Contact Details</h3>
        <ul>
            <li>Name : ${req.body.name}</li>
            <li>Email : ${req.body.email}</li>
        </ul>
        <h3>Message</h3>
        <p>${req.body.message}</p>
    `

    const data =  Contact.create({...req.body}) //this will send the client's message and information to my database for future refrences

    let transporter = nodemailer.createTransport({
        service : 'gmail',
        auth : {
            user : process.env.user,
            pass : process.env.pass
        }
    })

    let mailOptions = {
        from : `AGU NIGERIA<${process.env.user}>`, // sender address
        to: `<${req.body.email}>`, // list of receivers   
        subject : 'Greetings!', // Subject line
        text : `Hello ${req.body.name}. Thank you for contacting Agu Nigeria. We have received your message and will get back to you as soon as possible!`     
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        return res.render('contact', {msg:'Your message has been sent successfully. Please check your email!', layout : 'pages'});
    });

    let mailOptions2 = {        // This will send the mail to your email address
        from : `AGU NIGERIA<${process.env.user}>`, // sender address
        to: `<${process.env.user}>`, // list of receivers
        subject: `Message from ${req.body.name}!`, // Subject line
        html: output // html body
    };

    transporter.sendMail(mailOptions2, (error, info) => {
        if (error) {
            return console.log(error);
        }
       return console.log('Sent')
    });
}

exports.product = async (req, res) => {
    const products = await Products.find({})
    res.render('product', { products , layout : 'pages'})
}

exports.testimonial = (req, res) => {
    res.render('testimonial' , {layout : 'pages'})
}

exports.blog_list = (req, res) => {
    res.render('blog_list' , {layout : 'pages'})
}

exports.searchPage = (req, res) => {
    res.render('search', {layout : 'searchPage'})
}

exports.searchApi = async (req, res) => {
    try {
         const token = req.cookies.token
         const payload = jwt.verify(token, process.env.JWT_SECRET);
 
         const {searchQuery, name, amount} = req.query
         let queryObject = {}
 
         if (searchQuery) {
             queryObject.name =  {$regex : searchQuery, $options : 'xi'}
         }
 
         if (name) {
             queryObject.name =  {$regex : name, $options : 'xi'}
         }
 
       
         if (amount) {
             let operatorMap = {
                 "<" : "$lt",
                 "<=" : "$lte",
                 "=" : "$eq",
                 ">" : "$gt",
                 ">=" : "$gte"
             }
 
             const regEx = /\b(<|<=|=|>|>=)\b/g
 
             let filter = amount.replace(regEx, (match) => `*${operatorMap[match]}*`)
             // console.log(filter)
 
             const options = ['price']
 
             filter = filter.split(',').forEach((item) => {
                 const [regex, operator, value] = item.split('*')
                 if (options.includes(regex)) {
                     queryObject[regex] = {[operator] : Number(value)}
                 } 
             })
         }
         // console.log(queryObject)
         let result = Products.find(queryObject)
         
         const products = await result
         // console.log(products)
 
         return res.render('product', {name : payload.username, products, layout : 'landing'})
    } catch (error) {
         console.log(error)
         return res.status(StatusCodes.INTERNAL_SERVER_ERROR).render('index')
    }
 }
 

 exports.payment = async (req, res) => {
    try {
        const {value} = req.body

        const gender = value.split('>')[1]

        if (gender.startsWith('W')) {
            genderResult = gender.slice(0, 5)  
        }
        
        else if (gender.startsWith('M')) {
            genderResult = gender.slice(0, 3)
        }

        const price = value.split('>')[4]
        priceResult = price.split('&')[0]
        
        // console.log(genderResult)
        // console.log(priceResult)

        const result = {
            product : genderResult,
            amount : Number(priceResult)
        }

        const token = req.cookies.token
        const payload = jwt.verify(token, process.env.JWT_SECRET)

        const form = {
            full_name : payload.username,
            email : payload.email,
            product : result.product,
            amount : result.amount * 100,
        }

        console.log(form)

        initializePayment(form, (error, body)=>{
        if(error){
            //handle errors
            console.log(error);
            return;
       }
       response = JSON.parse(body);

       console.log(response)

       res.redirect(response.data.authorization_url)
    });

    } catch (error) {
        console.log(error)
        logger.error(error)
        return res.status(500).json({error : error.message})
    }
}
