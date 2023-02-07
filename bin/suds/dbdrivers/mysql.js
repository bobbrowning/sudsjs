
/** *********************************************
 * MySQ: database driver.  
 * 
 * ********************************************** */
let Database__Driver = 'mysql';    // To make documentation.js work...

let db = require('./sql-functions');
let knexUtils = require('knex-utils');

exports.connect = connect;
exports.createTable = createTable;
exports.getRow = getRow;
exports.getRows = getRows;
exports.countRows = countRows;
exports.totalRows = totalRows;
exports.createRow = createRow;
exports.deleteRow = deleteRow;
exports.deleteRows = deleteRows;
exports.updateRow = updateRow;
exports.standardiseId = standardiseId;

let auth = require('../../../local/auth');
let trace = require('track-n-trace');
let suds = require('../../../config/suds');

function connect() {
    let spec = suds[suds.dbDriver];
    trace.log({ connect: spec })
    try {
        let connection = spec.connection;
        connection.user = auth.mysql.user;
        connection.password = auth.mysql.password;
        trace.log({ client: 'mysql', connection: connection });
        globalThis.knex = require('knex')({
            client: 'mysql',
            connection: connection
        });
        console.log(`connected to ${spec.friendlyName} database`);
    }
    catch {
        console.log('Cant connect to ' + spec.friendlyName);
        process.exit(62)
    }

    knexUtils.checkHeartbeat(knex).then(
        function (heartbeat) {
            if (heartbeat.isOk) {
                console.log('Database alive and well');
            }
            else {
                console.log(heartbeat.error);
                console.log('Terminating process')
                process.exit(72)
            }
        }
    )

}
function createTable(a, b) { return db.createTable(a, b); }
function getRow(a, b, c) { return db.getRow(a, b, c); }
function getRows(a, b, c, d, e, f) { return db.getRows(a, b, c, d, e, f); }
function countRows(a, b) { return db.countRows(a, b); }
function totalRows(a, b, c) { return db.totalRows(a, b, c); }
function createRow(a, b) { return db.createRow(a, b); }
function deleteRow(a, b) { return db.deleteRow(a, b); }
function deleteRows(a, b, c) { return db.deleteRows(a, b, c); }
function updateRow(a, b) { return db.updateRow(a, b); }
function standardiseId(a) { return db.standardiseId(a); }


