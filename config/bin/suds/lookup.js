
let suds = require('../../config/suds');
let tableDataFunction = require('./table-data');
let lang = require('../../config/language')['EN'];
let trace = require('track-n-trace');
let db = require('./' + suds.dbDriver);

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
      value = db.standardiseId(value);
      trace.log(attributes.model, value)
      if (value && value != 'NaN' && value != '0') {
        let tableData = tableDataFunction(attributes.model);
        if (tableData.stringify) {
          trace.log(tableData.stringify);
          let record = await db.getRow(attributes.model, value);     // linked parent record
          trace.log(record);
          if (record.err) {
            display = `<span class="text-danger">${record.errmsg}</span>`;
          }
          else {
            if (typeof (tableData.stringify) == 'string') {
              display = record[tableData.stringify];
            }
            else {
              display = await tableData.stringify(record);
            }
          }


        }
        else {
          display = value;
        }
        trace.log(display);
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
    else {
      if (attributes.values && value) {
        if (typeof attributes.values == 'function') {
          let lvObject = attributes.values();
          if (Array.isArray(lvObject)) {return(value)}
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

      else {
        display = value;
      }
    }
    trace.log(display);
    return (display);
  }






