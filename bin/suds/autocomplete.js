/* ****************************************************
* automplete AJAX response.
* returns set of table rows depending on what has been typed in.
* Input data 
*    - table
*    - linked table for this field
*    - search term
*  
*  Only one automplete fields allowed per table  (needs work)
*
* *************************************************** */
let suds = require('../../config/suds');
let trace = require('track-n-trace');
let tableDataFunction = require('./table-data');
let getRows = require('./get-rows');
let getRow = require('./get-row');

module.exports = async function (req, res) {
  trace.log('#autocomplete called ', req.query);
  let allParms = req.query;
  let linkedTable = allParms.linkedtable;
  let display = allParms.display;
  let displayFunction = false;
  let tableData = tableDataFunction(linkedTable);
  if (tableData.rowTitle) {
    displayFunction = tableData.rowTitle;
  }
  if (!display && !displayFunction) {
    display = 'record found';
  }
  trace.log(display);
  let term = allParms.term;
  let limit = Number(allParms.limit);
  trace.log({ linkedTable: linkedTable, term: term, limit: limit });





  let search = {
    andor: 'and',
    limit: limit,
    searches: []
  };
  if (allParms.andor) { search.andor = allParms.andor; }
  for (let i = 0; i < suds.search.maxConditions; i++) {
    j = i + 1;
    let value = allParms['value_' + j];
    if (value == '#input') {
      value = term;
    }
    if (value == 'true') { value = true; }
    if (value == 'false') { value = false; }
    if (allParms['searchfield_' + j]) {
      search.searches[i] = [allParms['searchfield_' + j], allParms['compare_' + j], value]
    }
  }

    //  store names and IDs in an array of label/value objects
  let names = [];
  let records = await getRows(linkedTable,search);
  trace.log(records);
  for (i = 0; i < records.length; i++) {
    let show;
    if (display) {
      show = records[i][display];
    }
    else {
      show = displayFunction(records[i]);
    }
    trace.log('34', i, display, records[i]);
    names[i] = {};
    names[i].label = records[i].id + ':' + show;
    names[i].value = show;
  }
   let id=Number(term);
   if (!isNaN(id)) {
    let record = await getRow(id);
    if (record) {
      let show;
      if (display) {
        show = record[display];
      }
      else {
        show = await displayFunction(record);
      }
      trace.log('34', i, display, record);
      let label = record.id + ':' + show;
      let value = show;
      names.push({label: label,value:value});
    }

  }

  trace.log('#58 ', names);

  //  return array
  return res.json(names);
}