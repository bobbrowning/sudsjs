"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trace = require('track-n-trace');
const sendView = require('./send-view');
module.exports = async function (req, res) {
    console.log(__dirname);
    trace.log('login form');
    output = `
    <h1>Reset password</h1>
    <form name="cp" action="/changepw" method="post" style="width: 500px" onsubmit="return validateForm()">
    <input type="hidden" name="user" value="${req.query.user}">
    <input type="hidden" name="_csrf" value="${req.csrfToken()}" id="csrf" />
    <div class="form-group">
      <label for="token">The code that has been emailed to you</label>
      <input name="token" class="form-control" id="token" placeholder="Enter code" required>
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
`;
    const result = await sendView(res, 'admin', output);
    trace.log(result);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzZXQtcGFzc3dvcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYmluL3N1ZHMvcmVzZXQtcGFzc3dvcmQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDdEMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBRXZDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxXQUFXLEdBQUcsRUFBRSxHQUFHO0lBQ3ZDLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDdEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQTtJQUN2QixNQUFNLEdBQUc7Ozs4Q0FHbUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJOytDQUNiLEdBQUcsQ0FBQyxTQUFTLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F5QjdELENBQUE7SUFFQyxNQUFNLE1BQU0sR0FBRyxNQUFNLFFBQVEsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0lBQ25ELEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDbkIsQ0FBQyxDQUFBIn0=