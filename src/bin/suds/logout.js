const trace = require('track-n-trace')
const sendView = require('./send-view')
const suds = require('../../config/suds')

module.exports = async function (req, res) {
  console.log(__dirname)
  trace.log('Log out')
  const allParms = req.body
  trace.log(allParms)
  let output = `
    <h1>Register</h1>
     
`

  req.session.userId = false
  res.clearCookie('user')
  output += `<p>You have logged out - <a href="/admin">Admin page</a></p>
    <script>document.location="${suds.mainPage}"</script>`
  const result = await sendView(res, 'admin', output)
  trace.log(result)
}
