"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const Generic_Database__Driver = 'generic'; // To make documentation.js work...
const db = require('./sql-functions');
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
const auth = require('../../../local/auth');
const trace = require('track-n-trace');
const suds = require('../../../config/suds');
const local = require('../../../local/suds');
// function connect() { return db.connect(); }
function connect() {
    const spec = suds[suds.dbDriver];
    trace.log({ connect: spec });
    try {
        const connection = spec.connection;
        if (local.sqlite3 && local.sqlite3.connection) {
            for (const key of Object.keys(local.sqlite3.connection)) {
                connection[key] = local.sqlite3.connection[key];
            }
        }
        trace.log({ client: spec.client, connection });
        globalThis.knex = require('knex')({
            client: spec.client,
            connection
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
function deleteRow(a, b, c) { return db.deleteRow(a, b, c); }
function deleteRows(a, b, c) { return db.deleteRows(a, b, c); }
function updateRow(a, b) { return db.updateRow(a, b); }
function standardiseId(a) { return db.standardiseId(a); }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3FsaXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Jpbi9zdWRzL2RiZHJpdmVycy9zcWxpdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvREFzQm9EO0FBQ3BELE1BQU0sd0JBQXdCLEdBQUcsU0FBUyxDQUFBLENBQUMsbUNBQW1DO0FBRTlFLE1BQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO0FBRXJDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0FBQ3pCLE9BQU8sQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFBO0FBQ2pDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0FBQ3ZCLE9BQU8sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0FBQ3pCLE9BQU8sQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO0FBQzdCLE9BQU8sQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO0FBQzdCLE9BQU8sQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO0FBQzdCLE9BQU8sQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO0FBQzdCLE9BQU8sQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFBO0FBQy9CLE9BQU8sQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO0FBQzdCLE9BQU8sQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFBO0FBQ3JDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO0FBQzNDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUN0QyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtBQUM1QyxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQTtBQUU1Qyw4Q0FBOEM7QUFDOUMsU0FBUyxPQUFPO0lBQ2QsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUNoQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUE7SUFDNUIsSUFBSTtRQUNGLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUE7UUFDbEMsSUFBSSxLQUFLLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFO1lBQzdDLEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUN2RCxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUE7YUFDaEQ7U0FDRjtRQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFBO1FBQzlDLFVBQVUsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtZQUNuQixVQUFVO1NBQ1gsQ0FBQyxDQUFBO1FBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLFlBQVksV0FBVyxDQUFDLENBQUE7S0FDMUQ7SUFBQyxNQUFNO1FBQ04sTUFBTSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtLQUMvQztBQUNILENBQUM7QUFFRCxTQUFTLFdBQVcsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLE9BQU8sRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBQzNELFNBQVMsTUFBTSxDQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLE9BQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUN2RCxTQUFTLE9BQU8sQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFDM0UsU0FBUyxTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUN2RCxTQUFTLFNBQVMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFDN0QsU0FBUyxTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUN2RCxTQUFTLFNBQVMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFDN0QsU0FBUyxVQUFVLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksT0FBTyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBQy9ELFNBQVMsU0FBUyxDQUFFLENBQUMsRUFBRSxDQUFDLElBQUksT0FBTyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFDdkQsU0FBUyxhQUFhLENBQUUsQ0FBQyxJQUFJLE9BQU8sRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLENBQUMifQ==