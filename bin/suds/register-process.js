let trace = require('track-n-trace');
let sendView = require('./send-view');
//let getRow = require('./get-row');
//let createRow = require('./create-row');
//let updateRow = require('./update-row');
const suds = require('../../config/suds');
let db = require('./'+suds.database.driver);
let crypto = require('crypto');



module.exports = async function (req, res) {
    console.log(__dirname);
    trace.log('register form');
    let allParms = req.body;
    trace.log(allParms);
    output = `
    <h1>Register</h1>
     
`;

    userRec = {};
    userRec.createdAt = Date.now();
    userRec.updatedAt = Date.now();
    userRec.salt = crypto.randomBytes(32).toString('hex');
    userRec.password = crypto.pbkdf2Sync(allParms.password, userRec.salt, 10000, 64, 'sha512').toString('hex');
    userRec.emailAddress = allParms.emailAddress;
    userRec.fullName = allParms.fullName;
    trace.log(userRec);

    let oldRec = await db.getRow('user', allParms.emailAddress, 'emailAddress');
    trace.log(oldRec);
    if (oldRec.err) {
        let rec = await db.createRow('user', userRec);
        if (suds.audit.include 
            && (
                !suds.audit.operations
                || suds.audit.operations.includes('new')
            )) {
            await db.createRow('audit', {row: rec.id, mode: 'new', tableName: 'user', updatedBy: rec.id, notes: 'User Registration'});
        }

    }
    else {
        if (allParms.update) {
            userRec.id = oldRec.id;
            userRec.permission = null;
            await db.updateRow('user', userRec);
            if (suds.audit.include 
                && (
                    !suds.audit.operations
                    || suds.audit.operations.includes('new')
                )) {
                await db.createRow('audit', {row: userRec.id, mode: 'update', tableName: 'user', updatedBy: userRec.id, notes: 'Change Password'});
            }
    
        }
        else {
            output += `<p>Email address ${allParms.emailAddress} is already registered</p>`
            let result = await sendView(res, 'admin', output);
            trace.log(result);
            return;
        }


    }

    output += '<p>Regstration complete - <a href="/login">Log in</a></p?';
    let result = await sendView(res, 'admin', output);
    trace.log(result);
    return;



}