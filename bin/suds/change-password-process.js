let trace = require('track-n-trace');
let sendView = require('./send-view');
//let getRow = require('./get-row');
//let updateRow = require('./update-row');
let db=require('./db');
let crypto = require('crypto');

let suds = require('../../config/suds');

module.exports = async function (req, res) {
    console.log(__dirname);
    trace.log('register form');
    let allParms = req.body;
    trace.log(allParms);
    output = `
    <h1>Register</h1>
     
`;


    let userRec = await db.getRow('user', allParms.user);
    trace.log(userRec);
    if (userRec.err) {
        output += `<p>I can't find your record</p>`
        let result = await sendView(res, output);
        trace.log(result);
        return;
    }

    let OK=true;
    let err='';
    if (allParms.oldpassword) {
        let oldpassword = crypto.pbkdf2Sync(allParms.oldpassword, userRec.salt, 10000, 64, 'sha512').toString('hex');
        trace.log(oldpassword, userRec.salt);
        if (oldpassword != userRec.password) {
            err = `Sorry that password/code is not correct`;
            OK=false;
 
        }

    }
    else {
        let token = allParms.token.replace(' ','');
        trace.log(token, userRec.forgottenPasswordToken);
        if (token != userRec.forgottenPasswordToken) {
            err='That code does not match the code we sent.';
            OK=false;
        }
        if (OK && Date.now > userRec.forgottenPasswordExpire) {
            err='That code has expired.';
            OK=false;
   
        }
  
  
    }

   if (!OK) {
    output += `<p>${err} - <a href="${suds.mainPage}">Admin page</a></p>`;
    let result = await sendView(res, output);
    trace.log(result);
    return;

   }


  
    let newData = {};
    newData.id = allParms.user;
    newData.salt = crypto.randomBytes(32).toString('hex');
    newData.password = crypto.pbkdf2Sync(allParms.password, newData.salt, 10000, 64, 'sha512').toString('hex');
    trace.log(newData);
    await db.updateRow('user', newData);
    output += `<p>Password changed - <a href="${suds.mainPage}">Admin page</a></p>`;
    let result = await sendView(res, output);
    trace.log(result);
    return;





}