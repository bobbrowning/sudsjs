const trace = require('track-n-trace')
const sendView = require('./send-view')
const suds = require('../../config/suds')

module.exports = async function (req, res) {
  console.log(__dirname)
  trace.log('login form')
  let csrf = ''
  if (suds.csrf) { csrf = `<input type="hidden" name="_csrf" value="${req.csrfToken()}" id="csrf" />` }
  output = `
    <h1>Change password</h1>
    <form name="cp" action="/changepw" method="post" style="width: 500px" onsubmit="return validateForm()">
    ${csrf}
    <input type="hidden" name="user" value="${req.session.userId}">
    <div class="form-group">
      <label for="oldPassword">Your current password or a code that has been emailed to you</label>
      <input name="oldpassword" class="form-control" id="OldPassword" placeholder="Enter your current password/code" required>
    </div>
   <div class="form-group">
      <label for="InputPassword">New password</label>
      <input name="password" type="password" class="form-control" id="InputPassword" placeholder="Enter your new password" required>
    </div>
    <div class="form-group">
    <label for="InputPassword2">Repeat Password</label>
    <input name="password2" type="password" class="form-control" id="InputPassword2" placeholder="Re-enter your new password" required>
  </div>
   <button type="submit" class="btn btn-primary">Submit</button>
</form>

<script>
     function validateForm() {
         console.log(document.forms["cp"]["password"]);
         if (document.forms["cp"]["password"].value != document.forms["cp"]["password2"].value) {
             alert("The passwords do not match");
             return false;
         }
     }
 </script>
`

  const result = await sendView(res, 'admin', output)
  trace.log(result)
}
