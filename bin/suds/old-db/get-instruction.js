
let trace = require('track-n-trace');
let suds = require('../../config/suds');
/* ******************************************
  Typical  spec
  {
   search: {                                             // search specification
      andor: 'and',
      searches: [
        ['userType', 'eq', 'C'],
        ['fullName', 'contains', '#fullName']             // Name assigned in suds-home.js 
      ]
    },
    sort: ['id', 'DESC'],
    limit: 20,
  }

  creates an sql search and bindings * won't work with MONGO *
 
* **************************************** */

module.exports = function (table, spec) {

  trace.log({ input: arguments });
  let tableData = require('../../tables/' + table);
  trace.log({tableData: tableData,  maxdepth: 3});
  /* Rationalise the searchspec object */
  if (!spec.andor) { spec.andor = 'and'; }
  // if (!spec.sort) {
  //   spec.sort = [Object.keys(tableData.attributes)[0], 'DESC'];  // sort defaults to first field (normally ID) 
  // }
  let searches = [];
  if (spec.searches) { searches = spec.searches; }
  trace.log({ searches: spec.searches });
  let instruction = '';
  let bindings = [];
  let b = 0;
  for (i = 0; i < searches.length; i++) {
    if (i > 0) { instruction += ` ${spec.andor} ` }
    let searchField = searches[i][0];
    let compare = searches[i][1];
    let value = searches[i][2];
    trace.log({ searchField: searchField, compare: compare, value: value })


    /* OK this is a kludge.  But sometimes you want to allow people to search by */
    /*  a string field and/or a numeric field. This doesn't work because         */
    /*  you end up testing a numeric field against a string.  99% of the time    */
    /*  people are trying to find a product or person or something either by     */
    /*  name or ID.  ('enter product name or number') - that is my excuse anyway */
    if (searchField == tableData.primaryKey && !Number.isInteger(Number(value))) { continue }


    if (compare == 'startsWith' || compare == 'startswith') {
      instruction += `${searchField} like ?`
      bindings[b++] = `${value}%`
      continue;
    }
    if (compare == 'contains') {
      instruction += `${searchField} like ?`
      bindings[b++] = `%${value}%`
      continue;
    }
    bindings[b++] = value;
    if (compare == 'like') { instruction += `${searchField} like ?` }
    let qfield = searchField;
    if (suds.fixWhere) {
      qfield = table + '.' + searchField;
    }
    if (tableData.attributes[searchField].type == 'string') { value = '"' + value + '"' }
    if (compare == 'equals' || compare == 'eq') { instruction += `${qfield} = ?` }
    if (compare == 'less' || compare == 'lt') { instruction += `${qfield} < ?` }
    if (compare == 'more' || compare == 'gt') { instruction += `${qfield} > ?` }
    if (compare == 'le') { instruction += `${qfield} <= ?` }
    if (compare == 'ge') { instruction += `${qfield} >= ?` }
    if (compare == 'ne') { instruction += `${qfield} <> ?` }


  }


  trace.log({ instruction: instruction, bindings: bindings });



  return ([instruction, bindings]);
}


