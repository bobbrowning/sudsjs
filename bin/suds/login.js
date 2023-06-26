"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trace = require('track-n-trace');
const sendView = require('./send-view');
const suds = require('../../config/suds');
module.exports = async function (req, res) {
    console.log(__dirname);
    let csrfToken = '';
    if (suds.csrf) {
        csrfToken = req.csrfToken();
    }
    trace.log('login form');
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
    <input type="hidden" name="_csrf" value="${csrfToken}" id="csrf" />
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYmluL3N1ZHMvbG9naW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDdEMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQ3ZDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBRXpDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxXQUFXLEdBQUcsRUFBRSxHQUFHO0lBQ3ZDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDdEIsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFBO0lBQ2xCLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtRQUNiLFNBQVMsR0FBRyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUE7S0FDNUI7SUFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFBO0lBQ3ZCLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQTtJQUNiLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQTtJQUNaLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQTtJQUNiLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUU7UUFBRSxJQUFJLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUE7S0FBRTtJQUM3QyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0tBQUU7SUFDdEMsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUFFLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtLQUFFO0lBQ3ZDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQTtJQUNYLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFDZixFQUFFLEdBQUc7OztnQkFHTyxDQUFBO0tBQ2I7SUFFRCxJQUFJLE1BQU0sR0FBRzs7Ozs7K0NBS2dDLFNBQVM7OENBQ1YsSUFBSTs7O3lEQUdPLEdBQUc7Ozs7O3VEQUtMLElBQUk7Ozs7Ozs7OztFQVN6RCxFQUFFO0NBQ0gsQ0FBQTtJQUVDLE1BQU0sTUFBTSxHQUFHLE1BQU0sUUFBUSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUE7SUFDbkQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNuQixDQUFDLENBQUEifQ==