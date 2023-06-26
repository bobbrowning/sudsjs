"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trace = require('track-n-trace');
const sendView = require('./send-view');
// let getRow = require('./get-row');
// let createRow = require('./create-row');
// let updateRow = require('./update-row');
const suds = require('../../config/suds');
const db = require('./db');
const crypto = require('crypto');
module.exports = async function (req, res) {
    console.log(__dirname);
    trace.log('register form');
    const allParms = req.body;
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
    userRec.userType = 'I';
    userRec.isOrg = 'P';
    trace.log(userRec);
    const oldRec = await db.getRow('user', allParms.emailAddress, 'emailAddress');
    trace.log(oldRec);
    if (oldRec.err) {
        const rec = await db.createRow('user', userRec);
        if (suds.audit.include &&
            (!suds.audit.operations ||
                suds.audit.operations.includes('new'))) {
            await db.createRow('audit', {
                row: rec.id,
                mode: 'new',
                tableName: 'user',
                updatedBy: rec.id,
                notes: 'User Registration'
            });
        }
    }
    else {
        if (allParms.update) {
            userRec.id = oldRec.id;
            userRec.permission = null;
            await db.updateRow('user', userRec);
            if (suds.audit.include &&
                (!suds.audit.operations ||
                    suds.audit.operations.includes('new'))) {
                await db.createRow('audit', { row: userRec.id, mode: 'update', tableName: 'user', updatedBy: userRec.id, notes: 'Change Password' });
            }
        }
        else {
            output += `<p>Email address ${allParms.emailAddress} is already registered</p>`;
            const result = await sendView(res, 'admin', output);
            trace.log(result);
            return;
        }
    }
    output += '<p>Regstration complete - <a href="/login">Log in</a></p?';
    const result = await sendView(res, 'admin', output);
    trace.log(result);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0ZXItcHJvY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaW4vc3Vkcy9yZWdpc3Rlci1wcm9jZXNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBQ3RDLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQTtBQUN2QyxxQ0FBcUM7QUFDckMsMkNBQTJDO0FBQzNDLDJDQUEyQztBQUMzQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtBQUN6QyxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDMUIsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBRWhDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxXQUFXLEdBQUcsRUFBRSxHQUFHO0lBQ3ZDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDdEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQTtJQUMxQixNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFBO0lBQ3pCLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDbkIsTUFBTSxHQUFHOzs7Q0FHVixDQUFBO0lBRUMsT0FBTyxHQUFHLEVBQUUsQ0FBQTtJQUNaLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO0lBQzlCLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO0lBQzlCLE9BQU8sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDckQsT0FBTyxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsVUFB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