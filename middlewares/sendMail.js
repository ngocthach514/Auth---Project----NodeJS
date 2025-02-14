const nodemailer = require('nodemailer');
const transport = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
        pass: process.env.NODE_CODE_SENDING_EMAIL_PASSWORD
    }
});

module.exports = transport;