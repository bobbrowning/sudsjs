
let trace = require('track-n-trace');
let getRows = require('./get-rows');
let tableDataFunction = require('./table-data');



module.exports = async function (table, val,col) {
  trace.log({inputs:arguments})
  let record = {};
  let tableData = tableDataFunction(table);
  trace.log({tableData: tableData, maxdepth: 3})
  if (!col) {col=tableData.primaryKey};
  trace.log(col,val);
  let spec={ searches: [[col, 'eq', val]] };
  trace.log(spec);
  var recordarray = await getRows(table, spec);
  trace.log({ table: table, value: val, recordarray: recordarray });
  if (recordarray[0]) {
    record = recordarray[0];
    trace.log('Record: \n', record);
    return ((record));
  }
  else {
    let result = `No row ${col} = ${val} on table ${table}`;
    console.log(result);
    return ({ err: 1, errmsg: result });
  }

}


