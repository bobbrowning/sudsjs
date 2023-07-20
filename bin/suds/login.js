"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trace = require('track-n-trace');
const sendView = require('./send-view');
const suds = require('../../config/suds');
const csrf = require('./csrf');
module.exports = async function (req, res) {
    console.log(__dirname);
    trace.log('login form');
    csrf.setToken(req, true);
    let next = '';
    let log = '';
    let pass = '';
    if (req.query.next) {
        next = req.query.next;
    }
    if (req.query.l) {
        log = req.query.l;
    }
    if (req.query.p) {
        pass = req.query.p;
    }
    let go = '';
    if (req.query.l) {
        go = `
      <script>
      document.getElementById("login").submit();
      </script>`;
    }
    let output = `
    <div class="suds">

    <h1>Log in</h1>
    <form action="/login" method="post" class="sudsLogin" id="login">
    <input type="hidden" name="_csrf" value="${req.session.csrf}" id="csrf" />
    <input type="hidden" name="next" value="${next}" />
       <div class="form-group">
        <label for="InputEmail">Email address</label>
        <input name="emailAddress" type="email" value="${log}" class="form-control" id="InputEmail" placeholder="Enter  your email address" required>
        <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
    </div>
    <div class="form-group">
      <label for="InputPassword">Password</label>
      <input name="password" type="password"  value="${pass}" class="form-control" id="InputPassword" placeholder="Enter your password" required>
    </div>
    <div class="form-check">
    <input name="remember" type="checkbox" class="form-check-input" id="Remember">
    <label class="form-check-label" for="Remember">Remember me</label>
  </div>
    <button type="submit" class="btn btn-primary">Submit</button>
</form>
</div>
${go}
`;
    const result = await sendView(res, 'admin', output);
    trace.log(result);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYmluL3N1ZHMvbG9naW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDdEMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQ3ZDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBQ3pDLE1BQU0sSUFBSSxHQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUU1QixNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssV0FBVyxHQUFHLEVBQUUsR0FBRztJQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQ3RCLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUE7SUFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUMsSUFBSSxDQUFDLENBQUE7SUFDdkIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFBO0lBQ2IsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFBO0lBQ1osSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFBO0lBQ2IsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtRQUFFLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQTtLQUFFO0lBQzdDLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7S0FBRTtJQUN0QyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQUUsSUFBSSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0tBQUU7SUFDdkMsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFBO0lBQ1gsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUNmLEVBQUUsR0FBRzs7O2dCQUdPLENBQUE7S0FDYjtJQUdELElBQUksTUFBTSxHQUFHOzs7OzsrQ0FLZ0MsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJOzhDQUNqQixJQUFJOzs7eURBR08sR0FBRzs7Ozs7dURBS0wsSUFBSTs7Ozs7Ozs7O0VBU3pELEVBQUU7Q0FDSCxDQUFBO0lBRUMsTUFBTSxNQUFNLEdBQUcsTUFBTSxRQUFRLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUNuRCxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ25CLENBQUMsQ0FBQSJ9