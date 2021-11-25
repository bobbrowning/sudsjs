let trace = require('track-n-trace');
let sendView = require('./send-view');
//let getRow = require('./get-row');
//let createRow = require('./create-row');
let suds = require('../../config/suds');
let crypto = require('crypto');
let db = require('./db');

module.exports = async function (req, res) {
    console.log(__dirname);
    trace.log('login process');
    let allParms = {...req.body};
    trace.log(allParms);
    let next = '';
    if (allParms.next) {
        next = allParms.next
        next = next.replace(/:/g, '=');
        next = next.replace(/;/g, '&');
        next='?'+next;
    }
    output = `
    <h1>Register</h1>   
`;


    let userRec = await db.getRow('user', allParms.emailAddress, 'emailAddress');
    trace.log(userRec);
    if (userRec.err) {
        output += `<p>Email address ${allParms.emailAddress} is not registered</p>`
        let result = await sendView(res, 'admin', output);
        trace.log(result);
        return;
    }

    password = crypto.pbkdf2Sync(allParms.password, userRec.salt, 10000, 64, 'sha512').toString('hex');
    trace.log(password, userRec.salt);
    if (password != userRec.password) {
        output += '<p>Sorry that password is not correct - <a href="/login">Log in</a></p?';
        let result = await sendView(res, 'admin', output);
        trace.log(result);
        return;

    }
    req.session.userId = userRec.id;
    if (allParms.remember) { res.cookie('user', userRec.id, { maxAge: 1000 * 60 * 60 * suds.rememberPasswordExpire }) };
    output += `<p>Log in complete - <a href="${suds.mainPage}">Admin page</a></p>
    <script>document.location="${suds.mainPage}${next}"</script>`;
    if (suds.audit.include
        && (
            !suds.audit.operations
            || suds.audit.operations.includes('login')
        )) {
        await db.createRow('audit', { row: userRec.id, mode: 'login', tableName: 'user', updatedBy: userRec.id });
    }
    let date=Date.now();
    await db.updateRow('user', { id: userRec.id, lastSeenAt: date });
    
    trace.log(output);
    let result = await sendView(res, 'admin', output);
    trace.log(result);
    return;



}