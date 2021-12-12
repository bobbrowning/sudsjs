
let suds = require('../../config/suds');
let tableDataFunction = require('./table-data');
let lang = require('../../config/language')['EN'];
let trace = require('track-n-trace');
let db = require('./db');

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

  async function (attributes, val) {
    if (arguments[0] == suds.documentation) { return ({ friendlyName: friendlyName, description: description }) }
    trace.log(arguments);

    let display = false;
    let value = val;
    /** The field is a key to another table.  */
    if (attributes.model) {
      trace.log(attributes.model)
      value = Number(value);
      trace.log(attributes.model, value)
      if (value && value != 'NaN') {
        let tableData = tableDataFunction(attributes.model);
        if (tableData.rowTitle) {

          let record = await db.getRow(attributes.model, value);     // linked parent record
          trace.log(record);
          if (record.err) {
            display = `<span class="text-danger">${record.errmsg}</span>`;
          }
          else {
            if (typeof (tableData.rowTitle) == 'string') {
              display = record[tableData.rowTitle];
            }
            else {
              display = tableData.rowTitle(record);
            }
          }

        
      }
      else {
        display = value;
      }
      let listLink = lang.listParentLink;
      if (attributes.child === false) { listLink = lang.listLink }
      let openLink = '';
      if (attributes.display.openGroup) { openLink += `&opengroup=${attributes.display.openGroup}` }
      if (attributes.display.open) { openLink += `&open=${attributes.display.open}` }
      display += `
            &nbsp;<a href="${suds.mainPage}?table=${attributes.model}&mode=listrow&id=${value}${openLink}" >
            ${listLink} 
          </a>`;
    }
    else {
      display = lang.notSpecified;
    }
  }

/** Look up text based on values in the table definition onbject.
 * This may be:
 * - a function 
 * - an array of valid values in which case no action
 * - an object 
 */
if (attributes.values && value) {
  if (typeof attributes.values == 'function') {
    let lvObject = attributes.values();
    display = lvObject[value];
  }
  else {
    if (Array.isArray(attributes.values)) {
      display = value;
    }
    else {
      if (typeof attributes.values == 'string') {
        let values = require(`../../config/${attributes.values}`)
        display = values[value];
      }

      else {
        display = attributes.values[value];
      }
    }
  }
}
trace.log(display);
return (display);
  }





