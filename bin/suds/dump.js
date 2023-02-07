/* ****************************************
*
*  Database backup
*
**************************************** */
let trace = require('track-n-trace');
let suds = require('../../config/suds');
let lang = require('../../config/language')['EN'];
let db = require('./db');
const fs = require('fs');





module.exports = async function (req, res) {

  trace.log({ starting: 'Backup', break: '#', });


  permission = '#guest#';

  if (req.cookies.user) {
    req.session.userId = req.cookies.user;
  }

  if (req.session.userId) {
    user = await db.getRow('user', req.session.userId);
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
  let outstream = fs.createWriteStream('sudsdump');

  let tables = suds.tables;
  let searchSpec={
    searches: [],
  }
  for (let i = 0; i < tables.length; i++) {
    let table = tables[i];
    let data = await 
    db.getRows(table,searchSpec);
   // trace.log(table ,data);
    for (let i = 0; i < data.length; i++) {

      let outrec = JSON.stringify({ table: table, data: data[i] });
      await outstream.write(outrec+'\n');
    }
  }
  outstream.end();
  res.send('done');
}
