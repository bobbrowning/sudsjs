
const { exec } = require('child_process');
let trace = require('track-n-trace');
let sendView = require('./suds/send-view');
const suds = require('../config/suds');

module.exports = async function (req, res) {
    let instruction=`
    documentation build ./bin/${req.query.file} --shallow -f html -o ./public/documentation`;
    trace.log(instruction)
    exec(
        instruction,
     (err, stdout, stderr) => {
        if (err) {
         console.error(err)
        } else {
         console.log(`stdout: ${stdout}`);
         console.log(`stderr: ${stderr}`);
         output=`
         <p><a href="/documentation/index.html" target="_blank">Documentation generated</a></p>
         <p><a href="${suds.mainPage}">Back to the main menu.</p>
         `;
         let result = sendView(res, 'admin', output);
        }
      });
      return ('OK');
 
}
/*
let documentation=require ('documentation');

module.exports = async function (req, res) {
  documentation.build([req.query.file])
  .then(documentation.formats.html)
  .then(output => {
    let result = sendView(res, 'report', output);
  });
return('OK');
}
*/