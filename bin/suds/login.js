let trace = require('track-n-trace');
let sendView = require('./send-view');
let suds=

module.exports = async function (req, res) {
    console.log(__dirname);
    trace.log('login form' );
    output=`
    <div class="suds">

    <h1>Log in</h1>
    <form action="/login" method="post" class="sudsLogin">
       <div class="form-group">
        <label for="InputEmail">Email address</label>
        <input name="emailAddress" type="email" class="form-control" id="InputEmail" placeholder="Enter  your email address" required>
        <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
    </div>
    <div class="form-group">
      <label for="InputPassword">Password</label>
      <input name="password" type="password" class="form-control" id="InputPassword" placeholder="Enter your password" required>
    </div>
    <div class="form-check">
    <input name="remember" type="checkbox" class="form-check-input" id="Remember">
    <label class="form-check-label" for="Remember">Remember me</label>
  </div>
    <button type="submit" class="btn btn-primary">Submit</button>
</form>
</div>
`;

    let result = await sendView(res, 'admin',output);
    trace.log(result);
    return;



}