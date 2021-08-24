/**
 * This routine runs before every create or update function to make sure that the 
 * record presented to the DBM is according to the table definition.
  */



let trace = require('track-n-trace');
let suds = require('../../config/suds');

let tableDataFunction = require('./table-data');
let mergeAttributes = require('./merge-attributes');

module.exports = function (table, record) {
    trace.log({ inputs: arguments })
    let tableData = tableDataFunction(table);
    let attributes = mergeAttributes(table);
    let rec = {};
    for (let key of Object.keys(record)) {
        if (!attributes[key]) { continue }   // skip field if not in database
        if (attributes[key].collection) { continue }  //  ""     ""
        rec[key] = record[key];
        if (attributes[key].type == 'number') {
            rec[key] = parseInt(record[key])
            if (isNaN(rec[key])) { rec[key] = 0; }
        }
        if (attributes[key].type == 'boolean') {
            if (rec[key]) { rec[key] = true } else { rec[key] = false }
        }
    }
    trace.log('fixed:', rec);
    return (rec);
}


