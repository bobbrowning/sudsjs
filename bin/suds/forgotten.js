"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trace = require('track-n-trace');
const suds = require('../../config/suds');
const sendView = require('./send-view');
// let getRow = require('./get-row');
// let updateRow = require('./update-row');
const db = require('./db');
// let createRow = require('./create-row');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const lang = require('../../config/language').EN;
module.exports = async function (req, res) {
    trace.log('register form');
    const aut = suds.authorisation;
    const allParms = req.query;
    trace.log(allParms);
    output = `
    <h1>Forgotten Password</h1>
     
`;
    const userRec = await db.getRow(aut.table, allParms.emailAddress, aut.emailAddress);
    trace.log(userRec);
    if (userRec.err) {
        output += `<p>Email address ${allParms.emailAddress} is not registered</p>`;
        const result = await sendView(res, 'admin', output);
        trace.log(result);
        return;
    }
    const token = crypto.randomBytes(4).toString('hex');
    trace.log(token);
    const today = Date.now();
    expire = today + (suds.forgottenPasswordExpire * 60 * 60 * 24 * 1000);
    trace.log(today, expire, suds.forgottenPasswordExpire);
    const opts = suds.forgottenPasswordOptions;
    let text = opts.text;
    text = text.replace('{{user}}', userRec.id);
    text = text.replace('{{token}}', token);
    const mailOptions = {
        from: opts.from,
        to: allParms.emailAddress,
        subject: opts.subject,
        text
    };
    let errortext = '';
    async function wrappedSendMail(mailOptions) {
        return new Promise((resolve, reject) => {
            const transporter = nodemailer.createTransport(suds.emailTransport);
            transporter.sendMail(mailOptions, async function (error, info) {
                if (error) {
                    console.log(error);
                    resolve(false);
                    errortext = error;
                }
                else {
                    console.log('Email sent: ' + info.response);
                    resolve(true);
                }
            });
        });
    }
    const resp = await wrappedSendMail(mailOptions);
    trace.log(resp);
    if (resp) {
        const record = {};
        record[aut.primaryKey] = userRec[aut.primaryKey];
        record[aut.forgottenPasswordToken] = token;
        record[aut.forgottenPasswordExpire] = expire;
        trace.log(record);
        await db.updateRow(aut.table, record);
        output += '<p>An email has been sent to your email address.</p>';
        const result = await sendView(res, 'admin', output);
        trace.log(result);
    }
    else {
        trace.log(errortext);
        let err = '<table>';
        for (key of Object.keys(errortext)) {
            err += `<tr><td>${key}</td><td>${errortext[key]}</td></tr>`;
        }
        err += '</table>';
        output += `<p>Failed to send email.</p> ${err}`;
        await sendView(res, 'admin', output);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9yZ290dGVuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Jpbi9zdWRzL2ZvcmdvdHRlbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUN0QyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtBQUN6QyxNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUE7QUFDdkMscUNBQXFDO0FBQ3JDLDJDQUEyQztBQUMzQyxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7QUFFMUIsMkNBQTJDO0FBQzNDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUVoQyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUE7QUFDeEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUMsRUFBRSxDQUFBO0FBRWhELE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxXQUFXLEdBQUcsRUFBRSxHQUFHO0lBQ3ZDLEtBQUssQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUE7SUFDMUIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQTtJQUU5QixNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFBO0lBQzFCLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDbkIsTUFBTSxHQUFHOzs7Q0FHVixDQUFBO0lBRUMsTUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUE7SUFDbkYsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUNsQixJQUFJ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