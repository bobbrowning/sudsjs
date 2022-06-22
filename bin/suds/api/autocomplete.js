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
  let tableData = tableDataFunction(linkedTable, permission);
  trace.log(tableData);
  if (!permission || !tableData.canView) {
    let names = [['You do not have permission to access this table'], [0]];
    trace.log('#43 ', names);
    return res.json(names);
  }
  /** display is field to be displayed
   * displayFunction is function to create string
   */
  let display = false;
  let displayFunction = false;
  if (allParms.display) {
    display = allParms.display;
  }
  else {
    if (tableData.stringify) {
      if (typeof tableData.stringify == 'string') {
        display = tableData.stringify;
      }
      else {
        displayFunction = tableData.stringify;
      }
    }
  }
  if (!display && !displayFunction) {
    trace.log(allParms.display, tableData.stringify)
    return res.json([['No stringify field or function has been defined - please check the configuration'],[]]);
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
  trace.log({ records: records, display: display });

  for (i = 0; i < records.length; i++) {
    let show;
    if (display) {
      show = records[i][display];
    }
    else {
      if (typeof (tableData.stringify) == 'string') {
        show = records[i][tableData.stringify];
      }
      else {
        show = tableData.stringify(records[i]);
      }
      //     show = displayFunction(records[i]);
    }
    trace.log(tableData.stringify, i, show, records[i]);
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
        if (typeof (tableData.stringify) == 'string') {
          show = record[tableData.stringify];
        }
        else {
          show = tableData.stringify(record);
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