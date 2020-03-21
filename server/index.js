require('dotenv').config();

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded()); // to support URL-encoded bodies
app.use(cors())
const port = 3000

const nodemailer = require("nodemailer");
const Mailchimp = require('mailchimp-api-v3');


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post('/contact', (req, res) => {
    contactForm(req.body, (msg) => res.send(msg))
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))


async function contactForm(contactInfo, responseSender) {
    const { fName, lName, phone, email, state, city, zipCode, subject, message } = contactInfo;
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_KEY
        }
    });
    try {
        let messageForUs = await transporter.sendMail({
            from: `"${process.env.GMAIL_USER_NAME}" <${process.env.GMAIL_USER}>`,
            to: `"${process.env.GMAIL_USER_NAME}" <${process.env.GMAIL_USER}>`, 
            subject: "Message sent from website",
            text: `Sender: ${fName} ${lName} \n\n Subject: ${subject} \n\n Message: ${message}`, 
            html: `<b>Sender:</b> ${fName} ${lName} <br/><br/> <b>Subject:</b> ${subject} <br/><br/> <b>Message:</b> ${message}`
        });
        // console.log("Message sent: %s", messageForUs.messageId);

        let welcomeMessage = await transporter.sendMail({
            from: `"${process.env.GMAIL_USER_NAME}" <${process.env.GMAIL_USER}>`,
            to: email, 
            subject: "0cashtoclose.com | Thanks for reaching out",
            text: `Hi ${fName} ${lName}, \n\n We appreciate the time you took to send us a message. We'll be getting back to you shortly. \n\n Best Regards, \n The Savings Life Investments Team`, 
            html: `Hi ${fName} ${lName}, <br/><br/> We appreciate the time you took to send us a message. We'll be getting back to you shortly. <br/><br/> Best Regards, <br/> The Savings Life Investments Team`
        });
        // console.log("Message sent: %s", welcomeMessage.messageId);
    } catch(error) {
        responseSender("Sorry! There was a problem sending the message. Please try again or use on of our other contact options.")
        console.error("Error sending emails " + error)
    }

    const mailchimp = new Mailchimp(process.env.MAILCHIMP_API_KEY);
    try {
        const mailchimpResponse = await mailchimp.post('/lists/b9e49bd772/members', {
            email_address: email,
            status: "subscribed",
            merge_fields: {
                FNAME: fName,
                LNAME: lName,
                PHONE: phone,
                ZCODE: zipCode,
                CITY: city,
                STATE: state,
                SUBJECT: subject
            }
        })
    } catch(error) {
        if(error.status != 400) {
            console.error(error)
        }
        // responseSender("OK")
    }
    responseSender("OK")
}


