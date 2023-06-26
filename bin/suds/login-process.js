"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trace = require('track-n-trace');
const sendView = require('./send-view');
// let getRow = require('./get-row');
// let createRow = require('./create-row');
const suds = require('../../config/suds');
const crypto = require('crypto');
const db = require('./db');
module.exports = async function (req, res) {
    console.log(__dirname);
    trace.log('login process');
    const allParms = { ...req.body };
    const aut = suds.authorisation[suds[suds.dbDriver].authtable];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4tcHJvY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaW4vc3Vkcy9sb2dpbi1wcm9jZXNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBQ3RDLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUN2QyxxQ0FBcUM7QUFDckMsMkNBQTJDO0FBQzNDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUNoQyxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7QUFFMUIsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLFdBQVcsR0FBRyxFQUFFLEdBQUc7SUFDdkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUN0QixLQUFLLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0lBQzFCLE1BQU0sUUFBUSxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUE7SUFDaEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBRTdELEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDbkIsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFBO0lBQ25CLElBQUksUUFBUSxDQUFDLElBQUksRUFBRTtRQUNqQixJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQTtRQUNwQixJQUFJLElBQUksSUFBSSxjQUFjLElBQUksSUFBSSxJQUFJLE9BQU8sRUFBRTtZQUM3QyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQTtTQUNsQjth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