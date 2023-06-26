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
const readline = require('readline');
module.exports = async function (req, res) {
    trace.log({ starting: 'Backup', break: '#' });
    /*
      permission = '#guest#'
    
      if (req.cookies.user) {
        req.session.userId = req.cookies.user
      }
    
      if (req.session.userId) {
        user = await db.getRow('user', req.session.userId)
        trace.log(user)
        if (user.isSuperAdmin) { permission = '#superuser#' } else { permission = user.permission }
        if (suds.superuser == user.emailAddress) { permission = '#superuser#' }
        trace.log({ 'User record': user, level: 'verbose' })
      }
      /*
      if (permission !== '#superuser#') {
        res.send('<h2>Sorry, you don\'t have permission to run this program</h2>');
        return;
      }
      */
    const tableList = [];
    const attributesStore = {};
    let fileStream;
    console.log('reading input file');
    fileStream = await fs.createReadStream('sudsdump');
    const rl = await readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    console.log(rl.length, 'lines read');
    for await (const line of rl) {
        const rec = JSON.parse(line);
        let save = rec._id;
        if (suds[suds.dbDriver].dbkey === 'number' && typeof rec._id != 'number') {
            delete rec._id;
        }
        trace.log(rec);
        try {
            await db.createRow(rec.table, rec.data);
        }
        catch (err) {
            console.log(`Problem with record ${save} - skipped
      ${err}`);
        }
    }
    console.log('lines processes');
    let output = `<p>Done  
  <br /> <a href="/admin">Admin page</a></p>`;
    res.send('output');
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdG9yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaW4vc3Vkcy9yZXN0b3JlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7MkNBSTJDO0FBQzNDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUN0QyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtBQUN6QyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxFQUFFLENBQUE7QUFDaEQsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQzFCLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN4QixNQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUE7QUFFcEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLFdBQVcsR0FBRyxFQUFFLEdBQUc7SUFDdkMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUE7SUFDN0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7UUFtQkk7SUFDSixNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUE7SUFDcEIsTUFBTSxlQUFlLEdBQUcsRUFBRSxDQUFBO0lBQzFCLElBQUksVUFBVSxDQUFBO0lBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO0lBQ2pDLFVBQVUsR0FBRyxNQUFNLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUNsRCxNQUFNLEVBQUUsR0FBRyxNQUFNLFFBQVEsQ0FBQyxlQUFlLENBQUM7UUFDeEMsS0FBSyxFQUFFLFVBQVU7UUFDakIsU0FBUyxFQUFFLFFBQVE7S0FDcEIsQ0FBQyxDQUFBO0lBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFBO0lBRXBDLElBQUksS0FBSyxFQUFFLE1BQU0sSUFBSSxJQUFJLEVBQUUsRUFBRTtRQUMzQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQzVCLElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDbkIsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssS0FBSyxRQUFRLElBQUksT0FBTyxHQUFHLENBQUMsR0FBRyxJQUFJLFFBQVEsRUFBRTtZQUFFLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQTtTQUFFO1FBQzVGLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDZCxJQUFJO1lBQ0YsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO1NBQ3hDO1FBQ0QsT0FBTyxHQUFHLEVBQUU7WUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixJQUFJO1FBQ3JDLEdBQUcsRUFBRSxDQUFDLENBQUE7U0FDVDtLQUNGO0lBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0lBQzlCLElBQUksTUFBTSxHQUFHOzZDQUM4QixDQUFBO0lBRTNDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDcEIsQ0FBQyxDQUFBIn0=