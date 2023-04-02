
const trace = require('track-n-trace')

const suds = require('../../../config/suds')


exports.rawAttributes = rawAttributes

/**
 *
 * Quick attributes object without any processing
 * @param {string} table
 * @returns
 */
function rawAttributes (table) {
  const tableData = require('../../../tables/' + table)
  standardHeader = {}
  if (tableData.standardHeader) {
    standardHeader = require('../../../config/standard-header')[suds[suds.dbDriver].standardHeader]
  }
  if (!tableData.attributes && tableData.properties) {tableData.attributes=tableData.properties}  // for compatibility with the JSON schema standard=
  const combined = { ...standardHeader, ...tableData.attributes }
  return (combined)
}