let trace = require('track-n-trace');
let sendView = require('./send-view');
//let getRow = require('./get-row');
//let updateRow = require('./update-row');
let db=require('./db');

let createRow = require('./create-row');
let crypto = require('crypto');
let suds = require('../../config/suds');
var nodemailer = require('nodemailer');
let lang = require('../../config/language')['EN'];

module.exports = async function (req, res) {
    trace.log('register form');
    let allParms = req.query;
    trace.log(allParms);
    output = `
    <h1>Forgotten Password</h1>
     
`;


    let userRec = await db.getRow('user', allParms.emailAddress, 'emailAddress');
    trace.log(userRec);
    if (userRec.err) {
        output += `<p>Email address ${allParms.emailAddress} is not registered</p>`
        let result = await sendView(res, output);
        trace.log(result);
        return;
    }

    let token = crypto.randomBytes(4).toString('hex');
    trace.log(token);

    let today = Date.now();
    expire = today + (suds.forgottenPasswordExpire * 60 * 60 * 24 * 1000);

    trace.log(today, expire, suds.forgottenPasswordExpire);

    let text = lang.forgottenPasswordEmail;
    text = text.replace('{{url}}', suds.baseURL+'/resetpw');
    text = text.replace('{{user}}', userRec.id);
    text = text.replace('{{token}}', token);


    var transporter = nodemailer.createTransport(suds.emailTransport);
    var mailOptions = {
        from: 'sudsexpress21@gmail.com',
        to: 'bob@bobbrowning.me.uk',
        subject: 'Password Reset',
        text: text,
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    await db.updateRow('user', { id: userRec.id, forgottenPasswordToken: token, forgottenPasswordExpire: expire });

    output += '<p>An email has been sent to your email address.</p>';
    let result = await sendView(res, output);
    trace.log(result);
    return;



}