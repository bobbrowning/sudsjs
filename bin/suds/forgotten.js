let trace = require('track-n-trace');
let sendView = require('./send-view');
//let getRow = require('./get-row');
//let updateRow = require('./update-row');
let db = require('./db');

//let createRow = require('./create-row');
let crypto = require('crypto');
let suds = require('../../config/suds');
var nodemailer = require('nodemailer');
let lang = require('../../config/language')['EN'];

module.exports = async function (req, res) {
    trace.log('register form');
    let aut = suds.authorisation;

    let allParms = req.query;
    trace.log(allParms);
    output = `
    <h1>Forgotten Password</h1>
     
`;


    let userRec = await db.getRow(aut.table, allParms.emailAddress, aut.emailAddress);
    trace.log(userRec);
    if (userRec.err) {
        output += `<p>Email address ${allParms.emailAddress} is not registered</p>`
        let result = await sendView(res, 'admin', output);
        trace.log(result);
        return;
    }

    let token = crypto.randomBytes(4).toString('hex');
    trace.log(token);

    let today = Date.now();
    expire = today + (suds.forgottenPasswordExpire * 60 * 60 * 24 * 1000);

    trace.log(today, expire, suds.forgottenPasswordExpire);

    let opts=suds.forgottenPasswordOptions;
    let text = opts.text;
    text = text.replace('{{user}}', userRec.id);
    text = text.replace('{{token}}', token);

    var mailOptions = {
        from: opts.from,
        to: allParms.emailAddress,
        subject: opts.subject,
        text: text,
    };
    let errortext='';
    async function wrappedSendMail(mailOptions) {
        return new Promise((resolve, reject) => {
            let transporter = nodemailer.createTransport(suds.emailTransport);
            transporter.sendMail(mailOptions, async function (error, info) {
                if (error) {
                    console.log(error);
                    resolve(false);
                   errortext=error;
                }
                else {
                    console.log('Email sent: ' + info.response);
                    resolve(true);
                }

            });
        });

    }

    let resp=await wrappedSendMail(mailOptions);
    trace.log(resp);
    if (resp) {
        let record = {};
        record[aut.primaryKey] = userRec[aut.primaryKey];
        record[aut.forgottenPasswordToken] = token;
        record[aut.forgottenPasswordExpire] = expire;
        trace.log(record);
        await db.updateRow(aut.table, record);

        output += '<p>An email has been sent to your email address.</p>';
        let result = await sendView(res, 'admin', output);
        trace.log(result);
    }
    else {
        trace.log(errortext);
        let err='<table>';
        for (key of Object.keys(errortext)) {
            err+=`<tr><td>${key}</td><td>${errortext[key]}</td></tr>`;
        }
        err+=`</table>`;
    output += `<p>Failed to send email.</p> ${err}`;
    await sendView(res, 'admin', output);
     }
    return;



}