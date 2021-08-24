
let suds = require('../../config/suds');
let classes = require('../../config/classes');
let lang = require('../../config/language')['EN'];
let tableDataFunction = require('./table-data');
//let getRow = require('./get-row');
let trace = require('track-n-trace');
let db=require('./db');

/*
    inputs: {
      attributes: { type: 'ref' },      // Merged attributes of the field
      value: { type: 'ref' },           // Value of the field
      children: { type: 'number' },
      permission: { type: 'string' },    // Permission set of the current logged in user
    },
  
  */

module.exports =

  async function (attributes, value, children, permission) {
    trace.log(arguments);
    if (!value) return ('');
    let display = value;  // default do nothing
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

    let helper;

    if (attributes.input.type) {
      try {
        helper = require('./display/' + attributes.input.type);
      }
      catch (err) { }
      if (helper) {
        return (helperName(attributes, value))
      }
    }

    if (attributes.display.type == 'date') {
      if (value) {
        let date = new Date(value);
        display = date.toDateString();
      }
      else {
        display = '';
      }
    }

    if (attributes.display.type == 'datetime') {
      if (value) {
        let date = new Date(value);
        display = date.toString();
      }
      else {
        display = '';
      }
    }

    trace.log(value);
    if (attributes.display && attributes.display.JSON1) {
      let data = JSON.parse(value);
      display = '';
      for (let key of Object.keys(data)) {
        display += `${key}:${data[key]}<br />`;
      }

    }

    if (attributes.display && attributes.display.currency) {
      formatter = new Intl.NumberFormat(
        suds.currency.locale,
        {
          style: 'currency',
          currency: suds.currency.currency,
          minimumFractionDigits: suds.currency.digits,
        })
      display = formatter.format(value);
    }
    if (attributes.display && attributes.display.asterisks) {
      display = '*********************';
    }
    if (attributes.model) {
      value = Number(value);
      if (value && value != 'NaN') {
        let tableData = tableDataFunction(attributes.model);
        if (tableData.rowTitle) {

          let record = await db.getRow(attributes.model, value);     // linked parent record
          trace.log(record);
          if (record.err) {
            display = `<span class="text-danger">${record.errmsg}</span>`;
          }
          else {
            display = tableData.rowTitle(record);
          }
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
    if (attributes.input.values && value) {
      if (typeof attributes.input.values == 'function') {
        let lvObject = attributes.input.values();
        display = lvObject[value];
      }
      else {
        if (Array.isArray(attributes.input.values)) {
          display = value;
        }
        else {
          display = attributes.input.values[value];
        }
      }
    }
    if (value == null) { display = lang.notSpecified }
    trace.log(attributes, { level: 'verbose' });
    trace.log(display);

    return (display);
  }





