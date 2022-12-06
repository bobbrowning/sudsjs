/* ****************************************
*
*  Database backup
*
**************************************** */
let trace = require('track-n-trace');
let suds = require('../../config/suds');
let lang = require('../../config/language')['EN'];
let db = require('./' + suds.dbDriver);
const fs = require('fs');
const readline = require('readline');




module.exports = async function (req, res) {

  trace.log({ starting: 'Backup', break: '#', });


  permission = '#guest#';

  if (req.cookies.user) {
    req.session.userId = req.cookies.user;
  }

  if (req.session.userId) {
    user = await db.getRow('user', req.session.userId);
    trace.log(user);
    if (user.isSuperAdmin) { permission = '#superuser#' } else { permission = user.permission; }
    if (suds.superuser == user.emailAddress) { permission = '#superuser#' }
    trace.log({ 'User record': user, level: 'verbose' });
  }
  if (permission !== '#superuser#') {
    res.send('<h2>Sorry, you don\'t have permission to run this program</h2>');
    return;
  }
  let tableList = [];
  let attributesStore = {};
  let fileStream ;
  fileStream  = await fs.createReadStream('sudsdump');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
   let rec=JSON.parse(line);
   trace.log(rec);
   db.createRow(rec.table,rec.data);

  }



  res.send('done');
}
