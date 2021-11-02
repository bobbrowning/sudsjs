
let suds = require('../../config/suds');
let lookup = require('./lookup');
let tableDataFunction = require('./table-data');
let lang = require('../../config/language')['EN'];
let trace = require('track-n-trace');
let db = require('./db');

const friendlyName = 'Format field data';
const description = `For many types of field, this routine simply returns the 
value of the field. Dates, currency etc fields are formatted. If it is a 
foreign key it looks up the linked record and uses the rowTitle function 
for that table. If there is none, then just returns the value 
of the field. File upload fields have a link to the uploaded file.`;


module.exports = async function (attributes, value, children, permission) {
  if (arguments[0] == suds.documentation) { return ({ friendlyName: friendlyName, description: description }) }
  trace.log(arguments);



  let display = value;  // default do nothing

  /** Boolean  */
  if (attributes.type == 'boolean') {
    if (value) { return (lang.true) } else { return (lang.false) }
  }

  /** Null value */
  if (attributes.model && !value) { return (lang.notSpecified) }


  /** Otherwise empty return blank */
  if (!value && !attributes.collection) return ('');


  /** This field is something like customer type that determines how thendata is presented */
  if (attributes.recordTypeColumn) {
    display = attributes.recordTypes[value].friendlyName;
    return (display);
  }

  /** This is not a real field on the database, but itendifies a child column */
  trace.log(attributes.collection, children)
  if (attributes.collection) {
    let num = children;

    if (num == 0) { num = lang.no; }
    if (children == 1) {
      display = `${lang.thereIs} ${num} ${attributes.friendlyName} ${lang.row}`;
    }
    else {
      display = `${lang.thereAre} ${num} ${attributes.friendlyName} ${lang.rows}`;
    }
    return (display);
  }

  /** Some display types have a special routine to display it.  
   * The helper routine is stores in bin/suds/display   */
  let helper;
  trace.log({ value: value, type: attributes.type, displaytype: attributes.display.type });

  if (attributes.display.type) {
    try {
      helper = require('./display/' + attributes.display.type);
    }
    catch (err) { }
    if (helper) {
      return (helperName(attributes, value))
    }
  }


  /** Date  */
  trace.log(value, attributes.type, attributes.display.type);
  if (attributes.display.type == 'date') {
    let date = new Date(value);
    display = date.toDateString();
    return (display);
  }

  /** Date / time  */
  if (attributes.display.type == 'color' && value) {
    display = `<span style="background-color: ${value}">&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</span>`;
    return (display);
  }


  /** Date / time  */
  if (attributes.display.type == 'datetime') {
    let date = new Date(value);
    display = date.toString();
    return (display);
  }

 
  trace.log(attributes.friendlyName, value);
  if (attributes.display && attributes.display.JSON) {
    let data = JSON.parse(value);
    trace.log(value, data);
    let display = '';
    for (let i = 0; i < data.length; i++) {
      key = data[i];
      if (i > 0) { display += '; ' }
      trace.log(key);
      let lookedup = await lookup(attributes, key);
      trace.log(lookedup);
      display += `${lookedup}`;
    }
    return (display);
  }

  /** File upload */
  if (attributes.input && attributes.input.type == 'uploadFile') {
    display = `<a href="/uploads/${value}" target="_blank">${value}</a>`;
    return (display);
  }

  /** Currency */
  if (attributes.display && attributes.display.currency) {
    formatter = new Intl.NumberFormat(
      suds.currency.locale,
      {
        style: 'currency',
        currency: suds.currency.currency,
        minimumFractionDigits: suds.currency.digits,
      })
    display = formatter.format(value);
    return (display);
  }


  /** Show asterisks */
  if (attributes.display.type == 'asterisks') {
    return ('*********************');
  }

  /** The field is a key to another table.  */
  if (attributes.model) { return (await lookup(attributes, value)) };

  /** There are values in the table definition to look up. */
  if (attributes.values) { return (await lookup(attributes, value)) };


  return (display);
}





