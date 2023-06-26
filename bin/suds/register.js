"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trace = require('track-n-trace');
const sendView = require('./send-view');
const suds = require('../../config/suds');
module.exports = async function (req, res) {
    console.log(__dirname);
    trace.log('register form');
    let csrf = '';
    if (suds.csrf) {
        csrf = `<input type="hidden" name="_csrf" value="${req.csrfToken()}" id="csrf" />`;
    }
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
`;
    const result = await sendView(res, 'admin', output);
    trace.log(result);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYmluL3N1ZHMvcmVnaXN0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDdEMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQ3ZDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBRXpDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxXQUFXLEdBQUcsRUFBRSxHQUFHO0lBQ3ZDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDdEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQTtJQUMxQixJQUFJLElBQUksR0FBRyxFQUFFLENBQUE7SUFDYixJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7UUFBRSxJQUFJLEdBQUcsNENBQTRDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLENBQUE7S0FBRTtJQUNyRyxNQUFNLEdBQUc7OztNQUdMLElBQUk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXFCVCxDQUFBO0lBRUMsTUFBTSxNQUFNLEdBQUcsTUFBTSxRQUFRLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUNuRCxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ25CLENBQUMsQ0FBQSJ9