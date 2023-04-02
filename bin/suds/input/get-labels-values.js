
/**
 * Create a pair of arrays containing values and corresponding descriptions
 * to use is a select, chekboxes etc.
 */

const tableDataFunction = require('../table-data')
// let getRows = require('../get-rows');
const db = require('../db')

module.exports = async function (attributes, record) {
  trace = require('track-n-trace')
  trace.log(arguments)
  let linkedTable = ''
  if (attributes.model) { linkedTable = attributes.model }
  if (attributes.input.linkedTable) linkedTable = attributes.input.linkedTable

  const values = []
  const labels = []

  if (linkedTable) {
    trace.log(linkedTable)
    const tableData = tableDataFunction(linkedTable)
    let pk = tableData.primaryKey
    if (!pk) { pk = 'id' }
    let stringify = function (data) { return (data[pk]) }
    if (tableData.stringify
    ) {
      if (typeof tableData.stringify === 'function') { stringify = tableData.stringify } else { stringify = function (data) { return (data[tableData.stringify]) } }
    }
    trace.log(stringify)
    const search = {}
    if (attributes.input.search) {
      if (attributes.input.search.andor) { search.andor = attributes.input.search.andor }
      search.searches = []
      for (let i = 0; i < attributes.input.search.searches.length; i++) {
        trace.log(i, attributes.input.search.searches[i])
        value = attributes.input.search.searches[i][2]
        if (value.substr(0, 1) == '$') { value = record[value.substr(1)] }
        if (!value) { break }
        search.searches[i] = []
        search.searches[i][0] = attributes.input.search.searches[i][0]
        search.searches[i][1] = attributes.input.search.searches[i][1]
        search.searches[i][2] = value
      }
    }
    records = await db.getRows(linkedTable, search)

    for (let i = 0; i < records.length; i++) {
      trace.log(records[i])
      values[i] = records[i][pk]
      labels[i] = await stringify(records[i])
    }
  } else {
    if (attributes.values) {
      if (typeof attributes.values === 'function') {
        const lvObject = attributes.values()
        for (const key of Object.keys(lvObject)) {
          values.push(key)
          labels.push(lvObject[key])
        }
      } else {
        if (Array.isArray(attributes.values)) {
          for (let i = 0; i < attributes.values.length; i++) {
            values[i] = labels[i] = attributes.values[i]
          }
        } else {
          if (typeof attributes.values === 'string') {
            const lookup = require(`../../../config/${attributes.values}`)
            for (const key of Object.keys(lookup)) {
              values.push(key)
              labels.push(lookup[key])
            }
          } else {
            for (const key of Object.keys(attributes.values)) {
              values.push(key)
              labels.push(attributes.values[key])
            }
          }
        }
      }
    } else {
      console.log(`No source for ${attributes.friendlyName}`)
      return ('No source')
    }
  }
  trace.log({ values, labels })
  return ([values, labels])
}
