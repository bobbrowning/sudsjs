
/** *********************************************
 * Generic database driver.  This has been tested with 
 * sqlite3, mysql and postgesql.
 * 
 * createTable(req, res)
 * 
 * getRow(table, val, col)
 * 
 * getRows(table, spec, offset, limit, sortKey, direction,)
 * 
 * countRows(table,spec)
 * 
 * totalRows(table, spec, col)
 * 
 * createRow(table, record)
 * 
 * deleteRow(permission, table, id)
 * 
 * updateRow(permission, table, id)
 * 
 * @name generic_database__driver
 * 
 * ********************************************** */
let Generic_Database__Driver = 'generic';    // To make documentation.js work...

let db = require('./sql-functions');

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
let local = require('../../../local/suds');




//function connect() { return db.connect(); }
function connect() {
  let spec = suds[suds.dbDriver];
  trace.log({ connect: spec })
  try {
    let connection = spec.connection;
    if (local.sqlite3 && local.sqlite3.connection) {
      for (let key of Object.keys(local.sqlite3.connection)) {
        connection[key] = local.sqlite3.connection[key];
      }
    }
    trace.log({ client: spec.client, connection: connection });
    globalThis.knex = require('knex')({
      client: spec.client,
      connection: connection
    });
    console.log(`connected to ${spec.friendlyName} database`);
  }
  catch {
    throw ('Cant connect to ' + spec.friendlyName);
  }
}


function createTable(a, b) { return db.createTable(a, b); }
function getRow(a, b, c) { return db.getRow(a, b, c); }
function getRows(a, b, c, d, e, f) { return db.getRows(a, b, c, d, e, f); }
function countRows(a, b) { return db.countRows(a, b); }
function totalRows(a, b, c) { return db.totalRows(a, b, c); }
function createRow(a, b) { return db.createRow(a, b); }
function deleteRow(a, b,c) { return db.deleteRow(a, b,c); }
function deleteRows(a, b, c) { return db.deleteRows(a, b, c); }
function updateRow(a, b) { return db.updateRow(a, b); }
function standardiseId(a) { return db.standardiseId(a); }


