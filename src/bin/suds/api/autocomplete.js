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
const suds = require('../../../config/suds')
const trace = require('track-n-trace')
const tableDataFunction = require('../table-data')
const db = require('../db')

module.exports = async function (req, res) {
  trace.log('#autocomplete called ', req.query, req.session)
  const allParms = req.query
  const linkedTable = req.query.linkedtable
  const permission = req.session.permission
  trace.log(permission, linkedTable)
  /**
   * Sort out the field to be displayed, or the function that returns the
   * displayed text.
   */
  const tableData = tableDataFunction(linkedTable, permission)
  trace.log(tableData)
  if (!permission || !tableData.canView) {
    const names = [['You do not have permission to access this table'], [0]]
    trace.log('#43 ', names)
    return res.json(names)
  }
  /** display is field to be displayed
   * displayFunction is function to create string
   */
  let display = false
  let displayFunction = false
  if (allParms.display) {
    display = allParms.display
  } else {
    if (tableData.stringify) {
      if (typeof tableData.stringify === 'string') {
        display = tableData.stringify
      } else {
        displayFunction = tableData.stringify
      }
    }
  }
  if (!display && !displayFunction) {
    trace.log(allParms.display, tableData.stringify)
    return res.json([['No stringify field or function has been defined - please check the configuration'], []])
  }
  trace.log(display)
  const term = allParms.term
  const limit = Number(allParms.limit)
  trace.log({ linkedTable, term, limit })
  /**
   * Created the sort specification from the supplied data.
   */
  const search = {
    andor: 'and',
    limit,
    searches: []
  }
  if (req.query.sortfield) {
    search.sort = [req.query.sortfield, req.query.sortdirection]
  }
  if (allParms.andor) { search.andor = allParms.andor }
  for (let i = 0; i < suds.search.maxConditions; i++) {
    j = i + 1
    let value = allParms['value_' + j]
    if (value == '#input') {
      value = term
    }
    if (value == 'true') { value = true }
    if (value == 'false') { value = false }
    if (allParms['searchfield_' + j]) {
      search.searches[i] = [allParms['searchfield_' + j], allParms['compare_' + j], value]
    }
  }
  /**
   * store names and IDs arrays of labels/values
   */
  let names = []

  const labels = []
  const values = []
  const records = await db.getRows(linkedTable, search)
  trace.log({ records, display })

  for (let i = 0; i < records.length; i++) {
    trace.log(i, labels.length)
    let show
    if (display) {
      show = records[i][display]
    } else {
      if (typeof (tableData.stringify) === 'string') {
        show = records[i][tableData.stringify]
      } else {
        show = await tableData.stringify(records[i])
      }
      //     show = displayFunction(records[i]);
    }
    trace.log(tableData.stringify, i, show, records[i])
    /*
        names[i] = {};
        names[i].label = records[i][tableData.primaryKey] + ':' + show;
        names[i].value = show;
    */
    labels.push(show)
    values.push(records[i][tableData.primaryKey])
  }
  const id = Number(term)
  if (!isNaN(id)) {
    const record = await db.getRow(id)
    if (record) {
      let show
      if (display) {
        show = record[display]
      } else {
        if (typeof (tableData.stringify) === 'string') {
          show = record[tableData.stringify]
        } else {
          show = await tableData.stringify(record)
        }
        //          show = await displayFunction(record);
      }
      trace.log('34', i, display, record)
      /*
            let label = record[tableData.primaryKey] + ':' + show;
            let value = show;

            names.push({ label: label, value: value });
            */
      labels.push(show)
      values.push(record[tableData.primaryKey])
    }
  }
  names = [labels, values]
  trace.log('#58 ', names)

  //  return array
  return res.json(names)
}