/* ****************************************
*
*  Database backup
*
**************************************** */
const trace = require('track-n-trace')
const suds = require('../../config/suds')
const lang = require('../../config/language').EN
const db = require('./db')
const fs = require('fs')
const readline = require('readline')

module.exports = async function (req, res) {
  trace.log({ starting: 'Backup', break: '#' })
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
  const tableList = []
  const attributesStore = {}
  let fileStream
  console.log('reading input file')
  fileStream = await fs.createReadStream('sudsdump')
  const rl = await readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })
  console.log(rl.length, 'lines read')

  for await (const line of rl) {
    const rec = JSON.parse(line)
    let save = rec._id;
    if (suds[suds.dbDriver].dbkey === 'number' && typeof rec._id != 'number') { delete rec._id }
    trace.log(rec)
    try {
      await db.createRow(rec.table, rec.data)
    }
    catch (err) {
      console.log(`Problem with record ${save} - skipped
      ${err}`)
    }
  }
  console.log('lines processes')
  let output = `<p>Done  
  <br /> <a href="/admin">Admin page</a></p>`

  res.send('output')
}
