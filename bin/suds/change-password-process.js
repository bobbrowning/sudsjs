let trace = require('track-n-trace');
let suds = require('../../config/suds');
let sendView = require('./send-view');
//let getRow = require('./get-row');
//let updateRow = require('./update-row');
let db = require('./db');
let crypto = require('crypto');



module.exports = async function (req, res) {
    console.log(__dirname);
    trace.log('register form');
    let allParms = req.body;
    let aut = suds.authorisation;
    trace.log(aut);
    trace.log(allParms);
    output = `
    <h1>Register</h1>
     
`;


    let userRec = await db.getRow(aut.table, allParms.user);
    trace.log(userRec);
    if (userRec.err) {
        output += `<p>I can't find your record</p>`
        let result = await sendView(res, 'admin', output);
        trace.log(result);
        return;
    }

    let OK = true;
    let err = '';
    if (allParms.oldpassword) {
        let oldpassword = crypto.pbkdf2Sync(allParms.oldpassword, userRec[aut.salt], 10000, 64, 'sha512').toString('hex');
        trace.log(oldpassword, aut.passwordHash, userRec[aut.passwordHash]);
        if (oldpassword != userRec[aut.passwordHash]) {
            err = `Sorry that password/code is not correct`;
            OK = false;

        }

    }
    else {
        let token = allParms.token.replace(' ', '');
        trace.log(token, userRec[aut.forgottenPasswordToken]);
        if (token != userRec[aut.forgottenPasswordToken]) {
            err = 'That code does not match the code we sent.';
            OK = false;
        }
        if (OK && Date.now > userRec[aut.forgottenPasswordExpire]) {
            err = 'That code has expired.';
            OK = false;

        }


    }

    if (!OK) {
        output += `<p>${err} - <a href="${suds.mainPage}">Admin page</a></p>`;
        let result = await sendView(res, 'admin', output);
        trace.log(result);
        return;

    }



    let newData = {};
    newData[aut.primaryKey] = allParms.user;
    newData[aut.salt] = crypto.randomBytes(32).toString('hex');
    newData[aut.passwordHash] = crypto.pbkdf2Sync(allParms.password, newData.salt, 10000, 64, 'sha512').toString('hex');
    trace.log(newData);
    await db.updateRow(aut.table, newData);
    output += `<p>Password changed - <a href="${suds.mainPage}">Admin page</a></p>`;
    if (suds.audit.include
        && (
            !suds.audit.operations
            || suds.audit.operations.includes('changepw')
        )) {
        let record = {};
        record.row = userRec[aut.primaryKey];
        record.mode = 'changepw';
        record.tableName = aut.table;
        record.updatedBy = userRec[aut.primaryKey];
        record.notes = 'Change Password';
        await db.createRow('audit', record);
    }

    let result = await sendView(res, 'admin', output);
    trace.log(result);
    return;





}