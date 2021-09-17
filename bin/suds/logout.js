let trace = require('track-n-trace');
let sendView = require('./send-view');



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
    output += '<p>You have logged out - <a href="/admin">Admin page</a></p?';
    let result = await sendView(res, 'admin',output);
    trace.log(result);
    return;



}