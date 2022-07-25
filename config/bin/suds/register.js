let trace = require('track-n-trace');
let sendView = require('./send-view');


module.exports = async function (req, res) {
  console.log(__dirname);
  trace.log('register form');
  output = `
    <h1>Register</h1>
    <form action="/register" method="post">
    <input type="hidden" name="_csrf" value="${req.csrfToken()}" id="csrf" />
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
`;

  let result = await sendView(res, 'admin', output);
  trace.log(result);
  return;



}