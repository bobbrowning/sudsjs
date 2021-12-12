
let lang = require('../../config/language')['EN'];
let tableDataFunction = require('./table-data');

module.exports = async function (attributes, fieldValue) {
  let trace = require('track-n-trace');
  trace.log(arguments);

  return `<img source=/uploads/fieldValue>`;
}





