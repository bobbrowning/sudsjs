let trace = require('track-n-trace');
let sendView = require('./send-view');
//let getRow = require('./get-row');
//let createRow = require('./create-row');
//let updateRow = require('./update-row');
let db=require('./db');
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
        await db.createRow('user', userRec);
    }
    else {
        if (allParms.update) {
            userRec.id=oldRec.id;
            userRec.permission=null;
            await db.updateRow('user', userRec);
        }
        else {
            output += `<p>Email address ${allParms.emailAddress} is already registered</p>`
            let result = await sendView(res, output);
            trace.log(result);
            return;
        }


    }

    output += '<p>Regstration complete - <a href="/login">Log in</a></p?';
    let result = await sendView(res, output);
    trace.log(result);
    return;



}