
let tableDataFunction = require('../table-data');
//let getRows = require('../get-rows');
let db=require('../db');

module.exports = async function (attributes, record) {
  trace = require('track-n-trace');
  trace.log(arguments);
  let linkedTable = '';
  if (attributes.model) { linkedTable = attributes.model; }
  if (attributes.input.linkedTable) linkedTable = attributes.input.linkedTable;

  let values = [];
  let labels = [];

  if (linkedTable) {
    trace.log(linkedTable);
    let tableData = tableDataFunction(linkedTable);
    let pk = tableData.primaryKey;
    if (!pk) { pk = 'id'; }
    let rowTitle = function (record) { return (record[pk]) };
    if (tableData.rowTitle
    ) {
      rowTitle = tableData.rowTitle;
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
        search.searches[i]=[];
        search.searches[i][0] = attributes.input.search.searches[i][0];
        search.searches[i][1] = attributes.input.search.searches[i][1];
        search.searches[i][2] = value;
      }

    }
    records = await db.getRows(linkedTable, search);

    for (let i = 0; i < records.length; i++) {
      trace.log(records[i]);
      values[i] = records[i][pk];
      labels[i] = rowTitle(records[i]);
    }
  }
  else {
    if (attributes.input.values) {
      if (typeof attributes.input.values == 'function') {
        let lvObject = attributes.input.values();
        for (let key of Object.keys(lvObject)) {
          values.push(key);
          labels.push(lvObject[key]);
        }
      }
      else {
        if (Array.isArray(attributes.input.values)) {
          for (let i = 0; i < attributes.input.values.length; i++) {
            values[i] = labels[i] = attributes.input.values[i];
          }
        }
        else {
          for (let key of Object.keys(attributes.input.values)) {
            values.push(key);
            labels.push(attributes.input.values[key]);
          }
        }
      }
    }
    else {
      console.log(`No source for ${attributes.friendlyName}`)
      return ('No source');
    }
  }
  trace.log({ values: values, labels: labels });
  return ([values, labels]);
}




