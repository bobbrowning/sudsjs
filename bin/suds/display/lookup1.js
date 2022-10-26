
let tableDataFunction = require('../table-data');
  let trace = require('track-n-trace');

module.exports = async function (attributes, fieldValue) {
  trace.log(arguments);

  return fieldValue+'vvv'; 
}





