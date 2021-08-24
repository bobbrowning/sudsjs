
let trace = require('track-n-trace');
let tableDataFunction = require('./table-data');
let suds = require('../../config/suds');
const knex = require('knex')(suds.database);
let mergeAttributes = require('./merge-attributes');



module.exports = async function (table, record) {
  trace.log({ inputs: arguments })
  let tableData = tableDataFunction(table);
  let attributes = mergeAttributes(table);
  let rec = {};
  let condition = {};
 
  for (let key of Object.keys(record)) { 
    if (!attributes[key]) {continue}   // skip field if not in database
    if (attributes[key].collection) {continue}  //  ""     ""
    if (key == tableData.primaryKey) {
      condition[key]= record[key];
      continue;
    }
    rec[key] = record[key] ;
   }
   if (attributes.updatedAt) {rec.updatedAt=Date.now();}
   trace.log({ table: table, condition: condition, record: rec });
  await knex(table).where(condition).update(rec);
}


