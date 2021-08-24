
let trace = require('track-n-trace');
let suds = require('../../config/suds');

let tableDataFunction = require('./table-data');
let mergeAttributes = require('./merge-attributes');
let fixRecord = require('./fix-record');
const knex = require('knex')(suds.database);


module.exports = async function (table, record) {
  trace.log({ inputs: arguments })
  let tableData = tableDataFunction(table);
  let attributes = mergeAttributes(table);
  let rec = fixRecord(table, record);
   if (attributes.createdAt) {rec.createdAt=Date.now();}
   if (attributes.updatedAt) {rec.updatedAt=Date.now();}
   trace.log('inserting:', rec);
  let inserted;
  let id;
  try {
    trace.log(table, rec);
    temp=await knex(table).insert(rec).into(table).returning('*');
    trace.log(temp);
    if (suds.database.client == 'sqlite3') {
      console.log('Kludge needed to get the last inserted ID from sqlite. Thus WILL NOT WORK in a multi-user environment.')
      let last= await knex(table).orderBy('updatedAt','DESC').limit(1);
      trace.log(last);
      id=last[0][tableData.primaryKey];
    }
   else {
      inserted = await knex(table).select(knex.raw(`LAST_INSERT_ID()`)).limit(1);
      id = inserted[0]['LAST_INSERT_ID()']
    }
  }
  catch (err) {
    console.log(`Insert failed table: ${table}  Error: ${err}`);
  }
   trace.log(id);
  record[tableData.primaryKey] = id;
  return (record);
}


