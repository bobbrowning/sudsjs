"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = async function (req, res) {
    const trace = require('track-n-trace');
    const sendView = require('./send-view');
    // let getRow = require('./get-row');
    // let createRow = require('./create-row');
    const suds = require('../../config/suds');
    const crypto = require('crypto');
    const db = require('./db');
    const csrf = require('./csrf');
    console.log(__dirname);
    trace.log('login process');
    const allParms = { ...req.body };
    const aut = suds.authorisation[suds[suds.dbDriver].authtable];
    /** Check the csrf token */
    try {
        csrf.checkToken(req);
    }
    catch (err) {
        const dateStamp = new Date().toLocaleString();
        console.log(`
    ***********************************************
    csrf mis-match in login-process
    ${allParms.emailAddress}
    ${err}
    ***********************************************
        `);
        await sendView(res, 'admin', `
    <H1>There has been a problem</h1>
    <p>${err}</p>
    <a href='/admin'>Admin page</a>`);
        return;
    }
    trace.log(allParms);
    let next = '/admin';
    if (allParms.next) {
        next = allParms.next;
        if (next == 'configreport' || next == 'admin') {
            next = '/' + next;
        }
        else {
            next = next.replace(/:/g, '=');
            next = next.replace(/;/g, '&');
            next = '?' + next;
            next = suds.mainPage + next;
        }
    }
    let output = `
    <h1>Register</h1>   
`;
    const userRec = await db.getRow(aut.table, allParms.emailAddress, aut.emailAddress);
    trace.log(userRec);
    if (userRec.err) {
        output += `<p>Email address ${allParms.emailAddress} is not registered</p>`;
        const result = await sendView(res, 'admin', output);
        trace.log(result);
        return;
    }
    let password = crypto.pbkdf2Sync(allParms.password, userRec[aut.salt], 10000, 64, 'sha512').toString('hex');
    if (password != userRec[aut.passwordHash]) {
        output += '<p>Sorry that password is not correct - <a href="/login">Log in</a></p?';
        const result = await sendView(res, 'admin', output);
        trace.log(result);
        return;
    }
    req.session.userId = userRec[aut.primaryKey];
    let goto = '';
    if (next) {
        goto = `<script>document.location="${next}"</script>`;
    }
    if (allParms.remember) {
        let val;
        if (suds.dbtype == 'nosql') {
            val = db.stringifyId(req.session.userId);
            trace.log(val);
        }
        else {
            val = req.session.userId;
        }
        res.cookie('user', userRec[aut.primaryKey], { maxAge: 1000 * 60 * 60 * suds.rememberPasswordExpire });
    }
    else {
        res.clearCookie('user');
    }
    output += `<p>Please wait.  If delayed click here to go to the admin page <a href="${suds.mainPage}">Admin page</a></p>
    ${goto}`;
    if (suds.audit.include &&
        (!suds.audit.operations ||
            suds.audit.operations.includes('login'))) {
        await db.createRow('audit', {
            row: userRec[aut.primaryKey],
            mode: 'login',
            tableName: aut.table,
            updatedBy: userRec[aut.primaryKey],
            createAt: Date.now(),
            updateedAt: Date.now(),
        });
    }
    const upd = {};
    upd[aut.primaryKey] = userRec[aut.primaryKey];
    upd.lastSeenAt = Date.now();
    trace.log(aut.primaryKey, upd);
    await db.updateRow(aut.table, upd);
    trace.log(output);
    const result = await sendView(res, 'admin', output);
    trace.log(result);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4tcHJvY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaW4vc3Vkcy9sb2dpbi1wcm9jZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLFdBQVcsR0FBRyxFQUFFLEdBQUc7SUFFdkMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0lBQ3RDLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUN2QyxxQ0FBcUM7SUFDckMsMkNBQTJDO0lBQzNDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0lBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUNoQyxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDMUIsTUFBTSxJQUFJLEdBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBRTVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDdEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQTtJQUMxQixNQUFNLFFBQVEsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFBO0lBQ2hDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUc5RCwyQkFBMkI7SUFDMUIsSUFBSTtRQUFFLElBQUksQ0FBQyxVQUFVLENBQUUsR0FBRyxDQUFDLENBQUE7S0FBRTtJQUM3QixPQUFPLEdBQUcsRUFBRTtRQUNWLE1BQU0sU0FBUyxHQUFXLElBQUksSUFBSSxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFdEQsT0FBTyxDQUFDLEdBQUcsQ0FBQzs7O01BR1YsUUFBUSxDQUFD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