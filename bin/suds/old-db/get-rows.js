
let trace = require('track-n-trace');
let suds = require('../../config/suds');
let getInstruction = require('./get-instruction');
let mergeAttributes = require('./merge-attributes');
let tableDataFunction=require('./table-data');

const knex = require('knex')(suds.database);
/* ******************************************
    spec = {                                             // search specification
      andor: 'and',
      searches: [
        ['userType', 'eq', 'C'],
        ['fullName', 'contains', '#fullName']             // Name assigned in suds-home.js 
      ],
      sort: ['id', 'DESC'],
       limit: 20,
    }  

  creates an sql search and bindings * won't work with MONGO *
 
* **************************************** */

module.exports = async function (table, spec, offset, limit, sortKey, direction,) {

  trace.log({ input: arguments });
  if (!limit && spec.limit) {limit=spec.limit}
  let rows = {};
  let tableData = tableDataFunction(table);
  if (!sortKey) {sortKey=tableData.primaryKey;}
  if (!direction) {direction-'DESC';}
  trace.log(spec); 
  if (spec && spec.searches.length) {
    if (!spec.instruction) {
      spec.instruction = getInstruction(table, spec);
    }
    let instruction = spec.instruction[0];
    let bindings = spec.instruction[1];
    trace.log({ instruction: instruction, bindings: bindings, edit: tableData.canEdit });
    if (limit) {
      rows = await knex(table).whereRaw(instruction, bindings).orderBy(sortKey, direction).offset(offset).limit(limit);
    }
    else {
      rows = await knex(table).whereRaw(instruction, bindings).orderBy(sortKey, direction).offset(offset);
    }
  }
  else {
    if (limit) {
      rows = await knex(table).orderBy(sortKey, direction).offset(offset).limit(limit);
    }
    else {
      trace.log({ table: table, offset: offset, offset, order: sortKey, direction: direction })
      rows = await knex(table).orderBy(sortKey, direction).offset(offset);
    }
  }

  trace.log(rows);
  let attributes=require(`../../tables/${table}`)['attributes'];
  trace.log(attributes,{level: 'verbose'});
  for (let i = 0; i < rows.length; i++) {
    record = rows[i];
    for (let key of Object.keys(record)) {
      // standardise boolean value (on mysql = 0 or 1 type TINYINT)
      if (attributes.type == 'boolean') {
        trace.log(`fixing boolean: ${key} - ${record[key]}`)
        if (record[key]) { record[key] = true } else { record[key] = false }
      }
    }
  }


  return (rows);
}


