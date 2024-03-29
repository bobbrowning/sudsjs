const trace = require('track-n-trace')
const sendView = require('./send-view')
const suds = require('../../config/suds')

module.exports = async function (req, res) {
  console.log(__dirname)
  trace.log('register form')
  let csrf = ''
  if (suds.csrf) { csrf = `<input type="hidden" name="_csrf" value="${req.csrfToken()}" id="csrf" />` }
  output = `
    <h1>Register</h1>
    <form action="/register" method="post">
    ${csrf}
    <div class="form-group">
      <label for="InputName">Name</label>
      <input name="fullName" type="text" class="form-control" id="Inputname" placeholder="Enter your full name" required>
    </div>
      <div class="form-group">
        <label for="InputEmail">Email address</label>
        <input name="emailAddress" type="email" class="form-control" id="InputEmail" placeholder="Enter  your email address" required>
        <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
    </div>
    <div class="form-group">
      <label for="InputPassword">Password</label>
      <input name="password" type="password" class="form-control" id="InputPassword" placeholder="Enter the password you will use" required>
    </div>
    <div class="form-check">
    <input name="update" type="checkbox" class="form-check-input" id="update">
    <label class="form-check-label" for="Remember">Re-register: permissions will be removed and will need to be reset.</label>
  </div>

     <button type="submit" class="btn btn-primary">Submit</button>
</form>
`

  const result = await sendView(res, 'admin', output)
  trace.log(result)
}
