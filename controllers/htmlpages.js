const jwt = require('jsonwebtoken')
const Contact = require('../models/contact')
const Newsletter = require('../models/newsletter')
require('dotenv').config()

const Products = require('../models/products')  //database 

const nodemailer = require('nodemailer')
//Begining of Oauth configuration
const { google } = require('googleapis')

const { StatusCodes } = require('http-status-codes')
const OAuth2 = google.auth.OAuth2

const OAuth2_client = new OAuth2(process.env.clientId, process.env.clientSecret)
OAuth2_client.setCredentials({refresh_token : process.env.refreshToken})
//End of Oauth2 configuration

exports.index = async (req, res) => {
    const token = req.cookies.token
    const products = await Products.find({})
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        return res.render('index', {name : payload.username, products, layout : 'landing'})
    } catch (error) {
       // console.log(error)
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

    const accessToken = OAuth2_client.getAccessToken
    let transporter = nodemailer.createTransport({
        service : 'gmail',
        auth : {
            type : 'OAuth2',
            user : process.env.user,
            clientId : process.env.clientId,
            clientSecret : process.env.clientSecret,
            refreshToken : process.env.refreshToken,
            accessToken : accessToken
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

    const accessToken = OAuth2_client.getAccessToken
    let transporter = nodemailer.createTransport({
        service : 'gmail',
        auth : {
            type : 'OAuth2',
            user : process.env.user,
            clientId : process.env.clientId,
            clientSecret : process.env.clientSecret,
            refreshToken : process.env.refreshToken,
            accessToken : accessToken
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
        return res.render('contact', {msg:'Your message has been sent successfully. Please check your email!'});
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


