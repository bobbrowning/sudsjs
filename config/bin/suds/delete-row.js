
let suds = require('../../config/suds');
let trace = require('track-n-trace');
let mergeAttributes = require('./merge-attributes');
let tableDataFunction = require('./table-data');
let db = require('./'+suds.dbDriver);
let fs = require('fs');

module.exports = async function (permission, table, id) {
    trace.log({ inputs: arguments, break: '#', level: 'min' });


    /* ************************************************
    *
    *   set up the data
    *
    ************************************************ */

    let tableData = tableDataFunction(table, permission);
    let attributes = await mergeAttributes(table, permission);  // Merge field attributes in model with config.suds tables
    trace.log({ attributes: attributes, level: 'verbose' })
    let record = await db.getRow(table, id);     // populate record from database
    if (record.err) {
        return (`<h1>Unexpected error ${record.errmsg}/h1>`);
    }
    for (let key of Object.keys(record)) {
        if (attributes[key].process && attributes[key].process.uploadFile && record[key]) {
            let rootdir = __dirname;
            rootdir = rootdir.replace('/bin/suds', '');
            try {
                fs.unlinkSync(`${rootdir}/public/uploads/${record[key]}`);
                console.log(`successfully deleted ${rootdir}/public/uploads/${record[key]}`);
            } catch (err) {
                console.log(`Can't delete ${rootdir}/public/uploads/${record[key]}`);
            }
        }

    }

    output = await db.deleteRow(
        permission,
        table,
        id,
    );

    if (tableData.edit.postProcess) { await tableData.edit.postProcess(record, 'delete') }
 

    let footnote = `Row deleted`;
    return ({ output: output, footnote: footnote });

}

