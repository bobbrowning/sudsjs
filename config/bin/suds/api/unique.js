/* ****************************************************
* uique AJAX response.
*
* *************************************************** */
let suds = require('../../../config/suds');
let trace = require('track-n-trace');
let tableDataFunction = require('../table-data');
let db = require('../'+suds.dbDriver);

module.exports = async function (req, res) {
    trace.log('#unique called ', req.query);
    let table = req.query.table;
    let tableData = tableDataFunction(table, '#superuser#');
    let fieldName = req.query.field;
    let fieldValue = req.query.value;
    let id = req.query.id;
    let count = await db.countRows(table, {
        andor: 'and',
        searches: [
            [fieldName, 'eq', fieldValue],
            [tableData.primaryKey, 'ne', id],
        ]
    });
    trace.log(count);
    if (count==0) {
        return res.json(['OK']);
    } else {
        return res.json([
            'validationError',
            `Sorry that slug is not unique. `,
        ]);
    }
    //  return array
}