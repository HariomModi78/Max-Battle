const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    secure:true,
    host:"smtp.gmail.com",
    port:465,
    auth:{
        user:process.env.email,
        pass:process.env.pass

    }
})

module.exports = transporter;