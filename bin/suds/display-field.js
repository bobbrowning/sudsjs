
let suds = require('../../config/suds');
let lookup = require('./lookup');
let tableDataFunction = require('./table-data');
let lang = require('../../config/language')['EN'];
let trace = require('track-n-trace');
let db = require('./' + suds.dbDriver);

const friendlyName = 'Format field data';
const description = `For many types of field, this routine simply returns the 
value of the field. Dates, currency etc fields are formatted. If it is a 
foreign key it looks up the linked record and uses the rowTitle function 
for that table. If there is none, then just returns the value 
of the field. File upload fields have a link to the uploaded file.`;


module.exports = displayField;

async function displayField(attributes, value, children, permission, parent) {
  if (arguments[0] == suds.documentation) { return ({ friendlyName: friendlyName, description: description }) }
  trace.log(arguments);
  let display = '';


  if (attributes.type == 'object') {
    if (attributes.array && Array.isArray(value)) {
      trace.log(value);
      display += '<ol>';
      for (let i = 0; i < value.length; i++) {
        display += '<li>';
        display += await displayField(attributes, value[i], children, permission, parent)
        display += '</li>';
      }
      display += '</ol>';
      trace.log(display);
      return display;
    }
    else {
      trace.log('descending one level', Object.keys(attributes.object), value);
      if (!value) { return '' }
      display = "<ul>"
      for (let key of Object.keys(attributes.object)) {
        trace.log('next at level', key, value,);
        let item = 'No value';
        if (value[key]) {
          item = await displayField(attributes.object[key], value[key], children, permission, parent)
        }
        display += `<li>${attributes.object[key].friendlyName}: ${item}</li>`;
        trace.log(display);

      }
      display += "</ul>"
      trace.log(display);
      return (display);
    }
  }
  else {
    display = await displayItem(attributes, value, children, permission);
    trace.log(display);
    return display;
  }



  async function displayItem(attributes, value, children, permission) {

    trace.log({ item: attributes.qualifiedName, value });
    let display = value;  // default do nothing

    /** Boolean  */
    if (attributes.type == 'boolean') {
      if (value) { return (lang.true) } else { return (lang.false) }
    }

    /** Null value */
    if (attributes.model && !value) { return (lang.notSpecified) }


    /** Otherwise empty return blank */
    if (!value && !attributes.collection) return ('');


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



    /** Date  */
    trace.log({ value: value, type: attributes.type, displaytype: attributes.display.type });
    if (attributes.display.type == 'date') {
      let date = new Date(value);
      display = date.toDateString();
      return (display);
    }
    if (attributes.display.type == 'html') {
      return (encodeURI(value));
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

    if (attributes.display.type) {
      try {
        helper = require('./display/' + attributes.display.type);
      }
      catch (err) {
        trace.log(err)
      }
      if (helper) {
        trace.log('using helper', attributes.display.type);
        return (await helper(attributes, value))
      }
    }

    trace.log({ name: attributes.friendlyName, value: value, process: attributes.process });
    if ((attributes.process && attributes.process.JSON) || (attributes.array && attributes.array.type != 'object')) {
      let data;
      if (attributes.process && attributes.process.JSON) {
        data = JSON.parse(value);
      }
      else {
        data = value;
      }
      trace.log({ value: value, data: data });
      let display = value;
      if (Array.isArray(data)) {
        display = '';
        for (let i = 0; i < data.length; i++) {
          key = data[i];
          if (i > 0) { display += '; ' }
          trace.log(key);
          let lookedup = await lookup(attributes, key);
          trace.log(lookedup);
          display += `${lookedup}`;
        }
      }
      else {
        display = '';
        for (let key of Object.keys(data)) {
          display += `${key}:  ${JSON.stringify(data[key])}<br />`;
        }
      }
      return (display);
    }

    /** File upload */
    trace.log({attributes: attributes,maxdepth: 2});
    trace.log({ value: value, type: attributes.type, });
    if (attributes.input && attributes.input.type == 'uploadFile') {
      display = '';
      if (attributes.display.type == 'image') {
        let width = '100px';
        if (attributes.display.width) { width = attributes.display.width }
        display = `<a href="/uploads/${value}" target="_blank"><img src="/uploads/${value}" style="width: ${width};"></a>&nbsp;`;
      }
      display += `<a href="/uploads/${value}" target="_blank">${value}</a>`;
      return (display);
    }

    /** Currency */
    trace.log({ value: value, type: attributes.type, displaytype: attributes.display.type });
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
    trace.log({ value: value, model: attributes.model });
    if (attributes.model) {
      let look = (await lookup(attributes, value));
      trace.log(look);
      return look;
    };

    /** There are values in the table definition to look up. */
    if (attributes.values) {
      let item = await lookup(attributes, value);
      trace.log(attributes.qualifiedName, value)
      return item;
    };


    return (display);
  }
}





