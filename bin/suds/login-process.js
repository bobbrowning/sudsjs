
const trace = require('track-n-trace')
const sendView = require('./send-view')
// let getRow = require('./get-row');
// let createRow = require('./create-row');
const suds = require('../../config/suds')
const crypto = require('crypto')
const db = require('./db')

module.exports = async function (req, res) {
  console.log(__dirname)
  trace.log('login process')
  const allParms = { ...req.body }
  const aut = suds.authorisation[suds[suds.dbDriver].authtable]

  trace.log(allParms)
  let next = ''
  if (allParms.next) {
    next = allParms.next
    if (next == 'configreport' || next == 'admin') {
      next = '/' + next
    } else {
      next = next.replace(/:/g, '=')
      next = next.replace(/;/g, '&')
      next = '?' + next
      next = suds.mainPage + next
    }
  }
  output = `
    <h1>Register</h1>   
`

  const userRec = await db.getRow(aut.table, allParms.emailAddress, aut.emailAddress)
  trace.log(userRec)
  if (userRec.err) {
    output += `<p>Email address ${allParms.emailAddress} is not registered</p>`
    const result = await sendView(res, 'admin', output)
    trace.log(result)
    return
  }

  password = crypto.pbkdf2Sync(allParms.password, userRec[aut.salt], 10000, 64, 'sha512').toString('hex')
  if (password != userRec[aut.passwordHash]) {
    output += '<p>Sorry that password is not correct - <a href="/login">Log in</a></p?'
    const result = await sendView(res, 'admin', output)
    trace.log(result)
    return
  }
  req.session.userId = userRec[aut.primaryKey]
  let goto = ''
  if (next) { goto = `<script>document.location="${next}"</script>` }
  if (allParms.remember) {
    let val
    if (suds.dbtype == 'nosql') {
      val = db.stringifyId(req.session.userId)
      trace.log(val)
    } else {
      val = req.session.userId
    }
    res.cookie('user', userRec[aut.primaryKey], { maxAge: 1000 * 60 * 60 * suds.rememberPasswordExpire })
  } else {
    res.clearCookie('user')
  }
  output += `<p>Log in complete - <a href="${suds.mainPage}">Admin page</a></p>
    ${goto}`
  if (suds.audit.include &&
        (
          !suds.audit.operations ||
            suds.audit.operations.includes('login')
        )) {
    await db.createRow('audit', { row: userRec[aut.primaryKey], mode: 'login', tableName: aut.table, updatedBy: userRec[aut.primaryKey] })
  }
  const upd = {}
  upd[aut.primaryKey] = userRec[aut.primaryKey]
  upd.lastSeenAt = Date.now()
  trace.log(aut.primaryKey, upd)
  await db.updateRow(aut.table, upd)

  trace.log(output)
  const result = await sendView(res, 'admin', output)
  trace.log(result)
}
