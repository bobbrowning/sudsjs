
const suds = require('../../config/suds')
const trace = require('track-n-trace')
const mergeAttributes = require('./merge-attributes')
const tableDataFunction = require('./table-data')
const db = require('./db')
const fs = require('fs')

module.exports = async function (permission, table, id) {
  trace.log({ inputs: arguments, break: '#', level: 'min' })

  /* ************************************************
    *
    *   set up the data
    *
    ************************************************ */

  const tableData = tableDataFunction(table, permission)
  const attributes = await mergeAttributes(table, permission) // Merge field attributes in model with config.suds tables
  trace.log({ attributes, level: 'verbose' })
  const record = await db.getRow(table, id) // populate record from database
  if (record.err) {
    return (`<h1>Unexpected error ${record.errmsg}/h1>`)
  }
  for (const key of Object.keys(record)) {
    if (attributes[key]  && attributes[key].process && attributes[key].process.uploadFile && record[key]) {
      let rootdir = __dirname
      rootdir = rootdir.replace('/bin/suds', '')
      try {
        fs.unlinkSync(`${rootdir}/public/uploads/${record[key]}`)
        console.log(`successfully deleted ${rootdir}/public/uploads/${record[key]}`)
      } catch (err) {
        console.log(`Can't delete ${rootdir}/public/uploads/${record[key]}`)
      }
    }
  }
  trace.log(permission,
    table,
    id
  )
  let output = await db.deleteRow(
    permission,
    table,
    id
  )

  if (tableData.edit.postProcess) { await tableData.edit.postProcess(record, 'delete') }

  const footnote = 'Row deleted'
  return ({ output, footnote })
}
