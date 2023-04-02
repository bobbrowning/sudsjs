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

module.exports = async function (req, res) {
  trace.log({ starting: 'Backup', break: '#' })
  let output = ''

  permission = '#guest#'

  if (req.cookies.user) {
    req.session.userId = req.cookies.user
  }

  if (req.session.userId) {
    user = await db.getRow('user', req.session.userId)
    if (user.isSuperAdmin) { permission = '#superuser#' } else { permission = user.permission }
    if (suds.superuser == user.emailAddress) { permission = '#superuser#' }
    trace.log({ 'User record': user, level: 'verbose' })
  }
  if (permission !== '#superuser#') {
    res.send('<h2>Sorry, you don\'t have permission to run this program</h2>')
    return
  }
  const tableList = []
  const attributesStore = {}
  const outstream = fs.createWriteStream('sudsdump')
  output += '<H3>Writing to sudsdump</h3><p>'
  const tables = suds.tables
  const searchSpec = {
    searches: []
  }
  for (let i = 0; i < tables.length; i++) {
    const table = tables[i]
    const data = await
    db.getRows(table, searchSpec)
    // trace.log(table ,data);
    for (let i = 0; i < data.length; i++) {
      const outrec = JSON.stringify({ table, data: data[i] })
      await outstream.write(outrec + '\n')
    }
    output += `<br />${table} written - ${data.length} documents`
  }

  output += `<br />Done  
  <br /> <a href="/admin">Admin page</a></p>`
  outstream.end()
  res.send(output)
}
