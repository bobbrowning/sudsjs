"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { exec } = require('child_process');
const trace = require('track-n-trace');
const sendView = require('./suds/send-view');
const suds = require('../config/suds');
module.exports = async function (req, res) {
    const instruction = `
    documentation build ./bin/${req.query.file} --shallow -f html -o ./public/documentation`;
    trace.log(instruction);
    exec(instruction, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
        }
        else {
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            const output = `
         <p><a href="/documentation/index.html" target="_blank">Documentation generated</a></p>
         <p><a href="${suds.mainPage}">Back to the main menu.</p>
         `;
            sendView(res, 'admin', output);
        }
    });
    return ('OK');
};
/*
let documentation=require ('documentation')

module.exports = async function (req, res) {
  documentation.build([req.query.file])
  .then(documentation.formats.html)
  .then(output => {
    let result = sendView(res, 'report', output)
  })
return('OK')
}
*/
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9iaW4vZG9jcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDekMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBQ3RDLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO0FBQzVDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0FBRXRDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxXQUFXLEdBQUcsRUFBRSxHQUFHO0lBQ3ZDLE1BQU0sV0FBVyxHQUFHO2dDQUNVLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSw4Q0FBOEMsQ0FBQTtJQUMxRixLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBQ3RCLElBQUksQ0FDRixXQUFXLEVBQ1gsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ3RCLElBQUksR0FBRyxFQUFFO1lBQ1AsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtTQUNuQjthQUFNO1lBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLE1BQU0sRUFBRSxDQUFDLENBQUE7WUFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLE1BQU0sRUFBRSxDQUFDLENBQUE7WUFDaEMsTUFBTSxNQUFNLEdBQUc7O3VCQUVBLElBQUksQ0FBQyxRQUFRO1VBQzFCLENBQUE7WUFDRixRQUFRLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQTtTQUMvQjtJQUNILENBQUMsQ0FBQyxDQUFBO0lBQ0osT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ2YsQ0FBQyxDQUFBO0FBQ0Q7Ozs7Ozs7Ozs7O0VBV0UifQ==