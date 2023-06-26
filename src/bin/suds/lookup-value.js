
const suds = require('../../config/suds')
const tableDataFunction = require('./table-data')
const lang = require('../../config/language').EN
const trace = require('track-n-trace')
const mergeAttributes = require('./merge-attributes')
const lookup = require('./lookup')
const friendlyName = 'Look up text corresponding to field value'
const description = `Looks up the value in a values object in the table 
definition, or a linked table if this is a foreign key`

/*
    inputs: {
      attributes: { type: 'ref' },      // Merged attributes of the field
      value: { type: 'ref' },           // Value of the field
      children: { type: 'number' },
      permission: { type: 'string' },    // Permission set of the current logged in user
    },

  */

module.exports =

  async function (table, col, val) {
    return await lookup(mergeAttributes(table)[col], val)
  }
