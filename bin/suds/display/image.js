
const lang = require('../../../config/language').EN
const tableDataFunction = require('../table-data')

module.exports = async function (attributes, fieldValue) {
  const trace = require('track-n-trace')
  trace.log(arguments)
  let style = ''
  if (attributes.display.width) { style += ` width: ${attributes.display.width}` }
  return `<a href="/uploads/${fieldValue}" target="_blank"><img src="/uploads/${fieldValue}" style="${style}"></a>`
}
