
let suds = require('../../config/suds');
let tableDataFunction = require('./table-data');
let lang = require('../../config/language')['EN'];
let trace = require('track-n-trace');
let mergeAttributes = require('./merge-attributes');
let lookup = require('./lookup');
const friendlyName = 'Look up text corresponding to field value';
const description = `Looks up the value in a values object in the table 
definition, or a linked table if this is a foreign key`;

/*
    inputs: {
      attributes: { type: 'ref' },      // Merged attributes of the field
      value: { type: 'ref' },           // Value of the field
      children: { type: 'number' },
      permission: { type: 'string' },    // Permission set of the current logged in user
    },
  
  */

module.exports =

  async function (table,col,val) {

    return await lookup(mergeAttributes(table)[col],val)
  }








