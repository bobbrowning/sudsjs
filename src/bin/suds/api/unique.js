/* ****************************************************
* uique AJAX response.
*
* *************************************************** */
const suds = require('../../../config/suds')
const trace = require('track-n-trace')
const tableDataFunction = require('../table-data')
const db = require('../db')

module.exports = async function (req, res) {
  trace.log('#unique called ', req.query)
  const table = req.query.table
  const tableData = tableDataFunction(table, '#superuser#')
  const fieldName = req.query.field
  const fieldValue = req.query.value
  const count = await db.countRows(table, {
    andor: 'and',
    searches: [
      [fieldName, 'eq', fieldValue],
      ['id', 'ne', req.query.id]
    ]
  })
  trace.log(count)
  if (count == 0) {
    return res.json(['OK'])
  } else {
    return res.json([
      'validationError',
      'Sorry that is not unique. '
    ])
  }
  //  return array
}
