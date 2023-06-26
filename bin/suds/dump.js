"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* ****************************************
*
*  Database backup
*
**************************************** */
const trace = require('track-n-trace');
const suds = require('../../config/suds');
const lang = require('../../config/language').EN;
const db = require('./db');
const fs = require('fs');
module.exports = async function (req, res) {
    trace.log({ starting: 'Backup', break: '#' });
    let output = '';
    permission = '#guest#';
    if (req.cookies.user) {
        req.session.userId = req.cookies.user;
    }
    if (req.session.userId) {
        user = await db.getRow('user', req.session.userId);
        if (user.isSuperAdmin) {
            permission = '#superuser#';
        }
        else {
            permission = user.permission;
        }
        if (suds.superuser == user.emailAddress) {
            permission = '#superuser#';
        }
        trace.log({ 'User record': user, level: 'verbose' });
    }
    if (permission !== '#superuser#') {
        res.send('<h2>Sorry, you don\'t have permission to run this program</h2>');
        return;
    }
    const tableList = [];
    const attributesStore = {};
    const outstream = fs.createWriteStream('sudsdump');
    output += '<H3>Writing to sudsdump</h3><p>';
    const tables = suds.tables;
    const searchSpec = {
        searches: []
    };
    for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        const data = await db.getRows(table, searchSpec);
        // trace.log(table ,data);
        for (let i = 0; i < data.length; i++) {
            const outrec = JSON.stringify({ table, data: data[i] });
            await outstream.write(outrec + '\n');
        }
        output += `<br />${table} written - ${data.length} documents`;
    }
    output += `<br />Done  
  <br /> <a href="/admin">Admin page</a></p>`;
    outstream.end();
    res.send(output);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHVtcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaW4vc3Vkcy9kdW1wLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7MkNBSTJDO0FBQzNDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUN0QyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtBQUN6QyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxFQUFFLENBQUE7QUFDaEQsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQzFCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUV4QixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssV0FBVyxHQUFHLEVBQUUsR0FBRztJQUN2QyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQTtJQUM3QyxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUE7SUFFZixVQUFVLEdBQUcsU0FBUyxDQUFBO0lBRXRCLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7UUFDcEIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUE7S0FDdEM7SUFFRCxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO1FBQ3RCLElBQUksR0FBRyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDbEQsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQUUsVUFBVSxHQUFHLGFBQWEsQ0FBQTtTQUFFO2FBQU07WUFBRSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQTtTQUFFO1FBQzNGLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQUUsVUFBVSxHQUFHLGFBQWEsQ0FBQTtTQUFFO1FBQ3ZFLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFBO0tBQ3JEO0lBQ0QsSUFBSSxVQUFVLEtBQUssYUFBYSxFQUFFO1FBQ2hDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0VBQWdFLENBQUMsQ0FBQTtRQUMxRSxPQUFNO0tBQ1A7SUFDRCxNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUE7SUFDcEIsTUFBTSxlQUFlLEdBQUcsRUFBRSxDQUFBO0lBQzFCLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUNsRCxNQUFNLElBQUksaUNBQWlDLENBQUE7SUFDM0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQTtJQUMxQixNQUFNLFVBQVUsR0FBRztRQUNqQixRQUFRLEVBQUUsRUFBRTtLQUNiLENBQUE7SUFDRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN0QyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDdkIsTUFBTSxJQUFJLEdBQUcsTUFDYixFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQTtRQUM3QiwwQkFBMEI7UUFDMUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDcEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUN2RCxNQUFNLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFBO1NBQ3JDO1FBQ0QsTUFBTSxJQUFJLFNBQVMsS0FBSyxjQUFjLElBQUksQ0FBQyxNQUFNLFlBQVksQ0FBQTtLQUM5RDtJQUVELE1BQU0sSUFBSTs2Q0FDaUMsQ0FBQTtJQUMzQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUE7SUFDZixHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ2xCLENBQUMsQ0FBQSJ9