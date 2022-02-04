/** ****************************************************
 * 
 * automplete  response.
 * returns set of table rows depending on what has been typed in.
 * Input data 
 *    - linkedtable: table to be searched
 *    - display: feld to display if no display function.
 *    - term
 *    - limit
 *    - andor
 *    - searchfield_1   (_2, _3 etc)
 *    - compare_1   (_2, _3 etc)
 *    - value_1   (_2, _3 etc)
 *     
 *  If the term is numeric also looks for an exact match with 
 *  the record key 
 * 
 * returns [labels, values] where labels and values 
 * are matching arrays
 * 
 * *************************************************** */
let suds = require('../../../config/suds');
let trace = require('track-n-trace');
let tableDataFunction = require('../table-data');
let db = require('../' + suds.dbDriver);

module.exports = async function (req, res) {
  trace.log('#autocomplete called ', req.query);
  let allParms = req.query;
  let linkedTable = allParms.linkedtable;
  let permission = req.session.permission;
  trace.log(permission);
  /**
   * Sort out the field to be displayed, or the function that returns the 
   * displayed text. 
   */
  let display = allParms.display;
  let displayFunction = false;
  let tableData = tableDataFunction(linkedTable, permission);
  trace.log(tableData.canView);
  if (!permission || !tableData.canView) {
    let names = [['You do not have permission to access this table'], [0]];
    trace.log('#43 ', names);
    return res.json(names);
  }

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
  /**
   * Created the sort specification from the supplied data.
   */
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
  /**  
   * store names and IDs arrays of labels/values
   */
  let names = [];

  let labels = [];
  let values = [];
  let records = await db.getRows(linkedTable, search);
  trace.log(records);

  for (i = 0; i < records.length; i++) {
    let show;
    if (display) {
      show = records[i][display];
    }
    else {
      if (typeof (tableData.rowTitle) == 'string') {
        show = records[i][tableData.rowTitle];
      }
      else {
        show = tableData.rowTitle(records[i]);
      }
      //     show = displayFunction(records[i]);
    }
    trace.log('34', i, display, records[i]);
    /*
        names[i] = {};
        names[i].label = records[i][tableData.primaryKey] + ':' + show;
        names[i].value = show;
    */
    labels.push(show);
    values.push(records[i][tableData.primaryKey]);
  }
  let id = Number(term);
  if (!isNaN(id)) {
    let record = await db.getRow(id);
    if (record) {
      let show;
      if (display) {
        show = record[display];
      }
      else {
        if (typeof (tableData.rowTitle) == 'string') {
          show = record[tableData.rowTitle];
        }
        else {
          show = tableData.rowTitle(record);
        }
        //          show = await displayFunction(record);
      }
      trace.log('34', i, display, record);
      /*
            let label = record[tableData.primaryKey] + ':' + show;
            let value = show;
      
            names.push({ label: label, value: value });
            */
      labels.push(show);
      values.push(record[tableData.primaryKey]);

    }

  }
  names = [labels, values];
  trace.log('#58 ', names);

  //  return array
  return res.json(names);
}