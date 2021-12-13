let trace = require('track-n-trace');
let sendView = require('./send-view');
let suds = require('../../config/suds');



module.exports = async function (req, res) {
    console.log(__dirname);
    trace.log('Log out');
    let allParms = req.body;
    trace.log(allParms);
    output = `
    <h1>Register</h1>
     
`;


    req.session.userId = false;
    res.clearCookie('user');
    output += `<p>You have logged out - <a href="/admin">Admin page</a></p>
    <script>document.location="${suds.mainPage}"</script>`;
    let result = await sendView(res, 'admin',output);
    trace.log(result);
    return;



}