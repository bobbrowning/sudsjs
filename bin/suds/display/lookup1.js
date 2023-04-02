
const tableDataFunction = require('../table-data')
const trace = require('track-n-trace')

module.exports = async function (attributes, fieldValue) {
  trace.log(arguments)

  return fieldValue + 'vvv'
}
