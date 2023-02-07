
/**
 * Create a pair of arrays containing values and corresponding descriptions 
 * to use in select, chekboxes etc.
 */
const { trace } = require('console');
let suds = require('../../config/suds');
let tableDataFunction = require('./table-data');
let db = require('./db');

module.exports = async function (attributes, record) {
  let trace = require('track-n-trace');
  trace.log(arguments);
  let linkedTable = '';
  if (attributes.model) { linkedTable = attributes.model; }
  if (attributes.input.linkedTable) linkedTable = attributes.input.linkedTable;

  let values = [];
  let labels = [];
  trace.log(attributes.values);

  if (linkedTable) {
    trace.log(linkedTable);
    let tableData = tableDataFunction(linkedTable);
    let pk = tableData.primaryKey;
    if (!pk) { pk = 'id'; }
    let stringify = function (record) { return (record[pk]) };
    if (tableData.stringify
    ) {
      stringify = tableData.stringify;
    }
    let search = {};
    if (attributes.input.search) {
      if (attributes.input.search.andor) { search.andor = attributes.input.search.andor }
      search.searches = [];
      for (let i = 0; i < attributes.input.search.searches.length; i++) {
        trace.log(i, attributes.input.search.searches[i])
        value = attributes.input.search.searches[i][2];
        if (value.substr(0, 1) == '$') { value = record[value.substr(1)] }
        if (!value) { break; }
        search.searches[i] = [];
        search.searches[i][0] = attributes.input.search.searches[i][0];
        search.searches[i][1] = attributes.input.search.searches[i][1];
        search.searches[i][2] = value;
      }

    }
    records = await db.getRows(linkedTable, search);

    for (let i = 0; i < records.length; i++) {
      trace.log(records[i]);
      values[i] = records[i][pk];
      //   values[i]=db.stringifyId(values[i]);
      if (typeof (stringify) == 'function') {
        labels[i] = await stringify(records[i]);
      }
      else {
        labels[i] = records[i][stringify];
      }
    }
  }
  else {
    if (attributes.values) {
      if (typeof attributes.values == 'function') {
        let lvObject = attributes.values();
        if (Array.isArray(lvObject)) {
           for (let i=0;i<lvObject.length; i++) {
            values[i] = labels[i] = lvObject[i];
           }
        }
        else {
          for (let key of Object.keys(lvObject)) {
            values.push(key);
            labels.push(lvObject[key]);
          }
        }
      }
      else {
        if (Array.isArray(attributes.values)) {
          for (let i = 0; i < attributes.values.length; i++) {
            values[i] = labels[i] = attributes.values[i];
          }
        }
        else {
          if (typeof attributes.values == 'string') {
            let lookup = require(`../../config/${attributes.values}`)
            for (let key of Object.keys(lookup)) {
              values.push(key);
              labels.push(lookup[key]);
            }
          }

          else {
            for (let key of Object.keys(attributes.values)) {
              values.push(key);
              labels.push(attributes.values[key]);
            }
          }
        }
      }
    }
  }
  trace.log({ values: values, labels: labels });
  return ([values, labels]);
}




