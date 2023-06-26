"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** *********************************************
 *
 * Firebase database driver.
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
const Generic_Database__Driver = 'firebase'; // To make documentation.js work...
exports.connect = connect;
exports.createTable = createTable;
exports.createRow = createRow;
exports.getRow = getRow;
exports.getRows = getRows;
exports.countRows = countRows;
exports.totalRows = totalRows;
exports.deleteRow = deleteRow;
exports.deleteRows = deleteRows;
exports.updateRow = updateRow;
exports.standardiseId = standardiseId;
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
let trace = require('../../node_modules/track-n-trace');
const suds = require('../../config/suds');
const tableDataFunction = require('./table-data');
const mergeAttributes = require('./merge-attributes');
const lang = require('../../config/language').EN;
let db;
/** *********************************************
 *
 * Connect to database
 *
 * No parameters. The database specification is in
 * /config/suds.js.  Connects to the database and sets up
 * a global 'knex'
 *
 * ********************************************* */
async function connect() {
    suds.dbType = 'nosql';
    const serviceAccountKey = suds.database.keyFile;
    try {
        const serviceAccount = require('../../config/' + serviceAccountKey);
        initializeApp({
            credential: cert(serviceAccount)
        });
        globalThis.database = getFirestore();
        console.log('Connected successfully to Firestore database server');
    }
    catch (err) {
        console.log('Firestore database connected failed', err);
    }
}
/**
 *
 * Quick attributes object without any processing
 * @param {string} table
 * @returns
 */
function rawAttributes(table) {
    const tableData = require('../../tables/' + table);
    standardHeader = {};
    if (tableData.standardHeader) {
        standardHeader = require('../../config/standard-header');
    }
    const combined = { ...standardHeader, ...tableData.attributes };
    return (combined);
}
/** *********************************************
 *
 * Given a representation of the record key, returns
 * the standard format. Basically a stub for mongo
 * @param {undefined} Record key
 *
 * ******************************************** */
function standardiseId(id) {
    return id;
}
/** *********************************************
 *
 * Given a representation of the record key, returns
 * the format that can be p[assed in a URL
 * @param {undefined} Record key
 *
 * ******************************************** */
function xstringifyId(id) {
    let value;
    if (suds.dbDriverKey == 'objectId') {
        value = id.toString();
    }
    else {
        value = id;
    }
    return value;
}
function objectifyId(id) {
    let value;
    if (suds.dbDriverKey == 'objectId') {
        try {
            value = ObjectId(id);
        }
        catch (err) {
            value = '000000000000'; // valid but won't return anything
            trace.error(err);
        }
    }
    else {
        value = id;
    }
    return value;
}
/** ******************************************
 *
 *        GET INSTRUCTION
 *
 * Turns a search specification into a firsestore query object.
 *
 * @example
 * Typical  filter specification
 * {
 *  search: {
 *    andor: 'and',
 *    searches: [
 *       ['userType', 'eq', 'C'],
 *       ['fullName', 'contains', 'Acme']
 *     ]
 *   },
 *   sort: ['id', 'DESC'],
 *   limit: 20,
 * }
 *
 * @param {string} table - Table name
 * @param {Object} spec - Filter specification - see above
 * @returns {ref}  query reference
 *
 */
function getInstruction(table, spec) {
    trace.log({ input: arguments });
    const attributes = rawAttributes(table);
    /* Rationalise the searchspec object */
    if (!spec.andor) {
        spec.andor = 'and';
    }
    if (spec.andor == 'or') {
        throw 'Firestore does not support "OR" queries';
    }
    // if (!spec.sort) {
    //   spec.sort = [Object.keys(tableData.attributes)[0], 'DESC'];  // sort defaults to first field (normally ID)
    // }
    let searches = [];
    if (spec.searches) {
        searches = spec.searches;
    }
    trace.log({ searches });
    let query = database.collection(table);
    const b = 0;
    for (let i = 0; i < searches.length; i++) {
        const item = {};
        const searchField = searches[i][0];
        const compare = searches[i][1];
        const value = searches[i][2];
        const ta = attributes[searchField];
        //   if (ta.model || searchField == 'id') {
        //     value = objectifyId(value)
        //   }
        trace.log({ searchField, compare, value });
        insensitive = '';
        if (suds.caseInsensitive) {
            insensitive = 'i';
        }
        if (compare == 'startsWith' ||
            compare == 'startswith' ||
            compare == 'contains' ||
            compare == 'like') {
            throw 'Firestore does not support partial text queries';
        }
        let comp = '==';
        if (compare == 'less' || compare == 'lt') {
            comp = '<';
        }
        if (compare == 'more' || compare == 'gt') {
            comp = '>';
        }
        if (compare == 'le') {
            comp = '<=';
        }
        if (compare == 'ge') {
            comp = '>=';
        }
        if (compare == 'ne') {
            comp = '!=';
        }
        trace.log(searchField, comp, value);
        query = query.where(searchField, comp, value);
        //   console.log(query._queryOptions.fieldFilters);
    }
    return (query);
}
/**
 *
 *           FIX RECORD
 *
 * Try and ensure the record is database-ready
 * Makes sure numeric fields are numeric and boolean fields are boolean
 * Yeah I know wouldn't be necessary with Typescript.
 * Any id fields change to objectID
 *
 * record is the input record  this is transferred to rec so
 * as to eliminate non-schema fields
 *
 * @param {string} table - Table name
 * @param {object} record
 * @param {object} tableData - Table data from the schema
 * @param {object} attributes - extended attributes for each columns from the schema.
 * @returns {object} record - cloned
 *
 */
function fixWrite(table, record, attributes, mode) {
    trace.log({ table, record, mode, break: '+' });
    trace.log({ attributes, level: 'verbose' });
    const rec = {};
    if (record.id && typeof (record.id) === 'string' && mode != 'new') {
        rec.id = objectifyId(record.id);
        trace.log({ id: rec.id });
    }
    for (const key of Object.keys(attributes)) {
        trace.log(key);
        if (attributes[key].collection) {
            continue;
        } // Not a real field
        if (key == 'id') {
            continue;
        } // Done already
        trace.log(key, Array.isArray(record[key]), record[key]);
        if (attributes[key].array &&
            attributes[key].array.type != 'single' &&
            !Array.isArray(record[key])) {
            record[key] = [record[key]];
        }
        trace.log({
            key,
            type: attributes[key].type,
            array: attributes[key].array,
            collection: attributes[key].collection,
            val: record[key],
            num: Number(record[key]),
            isNan: isNaN(rec[key]),
            level: 'verbose'
        });
        if (attributes[key].array) {
            if (attributes[key].array.type != 'single') {
                trace.log(record[key], Array.isArray(record[key]));
                if (!Array.isArray(record[key])) {
                    if (record[key]) {
                        record[key] = [record[key]];
                    }
                    else {
                        record[key] = [];
                    }
                }
                rec[key] = [];
                trace.log(record[key]);
                for (let i = 0; i < record[key].length; i++) {
                    if (attributes[key].type == 'object' && record[key][i]) {
                        trace.log({ key, i, subrecord: record[key][i] });
                        rec[key][i] = fixWrite(table, record[key][i], attributes[key].object, mode);
                    }
                    else {
                        rec[key][i] = record[key][i];
                    }
                }
                trace.log(record[key], rec[key]);
            }
            else {
                /** single means the record value will be a JSON string.  So don't go any deeper.. */
                rec[key] = record[key];
            }
        }
        else {
            trace.log(attributes[key].type);
            if (attributes[key].type == 'object' && record[key]) {
                trace.log('down a level', key, record[key]);
                rec[key] = fixWrite(table, record[key], attributes[key].object, mode);
                trace.log(rec[key]);
            }
            //   if (!attributes[key]) { continue }   // skip field if not in database
            /** For new records, guarantee that they have every field */
            else {
                trace.log(typeof record[key]);
                if (typeof record[key] === 'undefined' && mode == 'new') {
                    record[key] = null;
                }
                trace.log('final processing');
                if (typeof record[key] !== 'undefined') {
                    rec[key] = record[key];
                    if (attributes[key].type == 'number') {
                        rec[key] = Number(record[key]);
                        if (isNaN(rec[key])) {
                            rec[key] = 0;
                        }
                    }
                    if (attributes[key].model) {
                        if (rec[key] && rec[key] != '0' && typeof (rec[key]) === 'string') {
                            rec[key] = objectifyId(rec[key]);
                        }
                    }
                    if (attributes[key].type == 'boolean') {
                        if (rec[key]) {
                            rec[key] = true;
                        }
                        else {
                            rec[key] = false;
                        }
                    }
                }
            }
        }
        trace.log({ key, old: record[key], new: rec[key] });
    }
    trace.log({ fixed: rec });
    return (rec);
}
/** ************************************************
 *
 * Fix any iassues with the record read.
 * Change ObjectId to string
 *
 * *********************************************** */
function fixRead(record, attributes) {
    trace.log(record);
    if (record.id) {
        record.id = record.id.toString();
    }
    for (const key of Object.keys(record)) {
        trace.log({ key, data: record[key], level: 'verbose' });
        if (!attributes[key]) {
            continue;
        }
        ; // do nothing if item not in schema
        trace.log({ array: attributes[key].array, data: record[key] });
        if (attributes[key].array) {
            trace.log(record[key]);
            if (!Array.isArray(record[key])) {
                if (record[key]) {
                    record[key] = [record[key]];
                }
                else {
                    record[key] = [];
                }
            }
            for (let i = 0; i < record[key].length; i++) {
                if (attributes[key].type == 'object' && record[key][i]) {
                    trace.log({ key, i, subrecord: record[key][i] });
                    fixRead(record[key][i], attributes[key].object);
                }
                if (attributes[key].model && record[key][i]) {
                    record[key][i] = record[key][i].toString();
                }
            }
        }
        else {
            trace.log(attributes[key].type, record[key]);
            if (attributes[key].type == 'object' && record[key]) {
                fixRead(record[key], attributes[key].object);
            }
            else {
                trace.log({ model: attributes[key].model, data: record[key] });
                if (attributes[key].model && record[key]) {
                    record[key] = record[key].toString();
                    trace.log({ key, data: record[key], level: 'verbose' });
                }
            }
        }
        trace.log({ key, data: record[key], level: 'verbose' });
    }
    trace.log(record);
}
/**
 * Create a row in the table
 *
 * The method of obtaining the primary key is database dependent.
 * This has been tested withMySQL. Postgesql and SqLite3
 * The fallack is to read the most recently added record. However
 * this may not be reliable in a multi-user situation.
 *
 * @param {string} table
 * @param {object} record
 * @returns {object} record with primary key added
 */
async function createRow(table, record) {
    trace.log({ inputs: arguments });
    const tableData = tableDataFunction(table);
    const attributes = mergeAttributes(table);
    const rec = fixWrite(table, record, attributes, 'new');
    for (const key of Object.keys(attributes)) {
        if (attributes[key].process.createdAt) {
            rec[key] = Date.now();
        }
        if (attributes[key].process.updatedAt) {
            rec[key] = Date.now();
        }
    }
    trace.log('inserting:', table, rec);
    const result = await database.collection(table).add(rec);
    trace.log(result, result);
    trace.log(typeof (result.id));
    return (rec);
}
/**
 *
 * Count Rows
 *
 * Counts the number of rows given a filter specification
 *
 * Development - returns fixed value. Would need changing for production
 *
 * @param {string} table - Table name
 * @param {Object} spec - Filter specification - see get instruction above.
 * @returns {number} Record count
 */
async function countRows(table, spec) {
    trace.log({ input: arguments });
    return (100);
}
/**
 *
 * Total Rows
 *
 * Totals one column given a filter specification (see above)
 *
 * @param {string} table - Table name
 * @param {Object} spec - Filter specification - see get instruction above.
 * @param {string} Column name
 * @returns {number} Record count
 */
async function totalRows(table, spec, col) {
    trace.log({ input: arguments });
    const collection = database.collection(table);
    let total = 0;
    let query = {};
    if (spec) {
        query = getInstruction(table, spec);
        trace.log(query);
    }
    try {
        total = await collection.aggregate([
            {
                $match: query
            },
            {
                $group: {
                    id: null,
                    result: { $sum: '$' + col }
                }
            }
        ]).toArray();
    }
    catch (err) {
        console.log(err);
    }
    trace.log({ total });
    if (!total.length)
        return (0);
    return (total[0].result);
}
/**
 * Delete Rows
 * @param {string} table
 * @param {object} spec - see above
 * @returns {string} HTML output
 */
async function deleteRows(table, spec) {
    trace.log({ input: arguments });
    const collection = database.collection(table);
    if (spec && spec.searches.length) {
        if (!spec.instruction) {
            spec.instruction = getInstruction(table, spec);
        }
        const instruction = spec.instruction;
        trace.log(instruction);
        try {
            collection.deleteMany(instruction);
        }
        catch (err) {
            console.log(`Database error deleting Rows in table ${table} `, err);
            message = 'Unexpected error 51';
        }
        output = `
      <h2>Deleting records</h2>
      <DIV CLASS="footerlinks">
     
       <button class="btn btn-primary" onclick="window.location='${suds.mainPage}?table=${table}&mode=list'">${lang.tableList}</button>
           <button class="btn btn-primary" onclick="window.location='${suds.mainPage}'">${lang.backToTables}</button>
    </DIV>
  `;
    }
    else {
        output = `
      <h2>Deleting records failed - no search specification</h2>
       
      <DIV CLASS="footerlinks">
     
       <button class="btn btn-primary" onclick="window.location='${suds.mainPage}?table=${table}&mode=list'">${lang.tableList}</button>
           <button class="btn btn-primary" onclick="window.location='${suds.mainPage}'">${lang.backToTables}</button>
    </DIV>
  `;
    }
    return (output);
}
/**
 * Delete one row
 * @param {*} permission set
 * @param {*} table
 * @param {*} id - primary key
 * @returns {string} HTML
 */
async function deleteRow(permission, table, id) {
    trace = require('track-n-trace');
    trace.log({ start: 'Delete table row', inputs: arguments, break: '#', level: 'min' });
    const collection = database.collection(table);
    let mainPage = suds.mainPage;
    const tableData = tableDataFunction(table);
    if (typeof (id) === 'string') {
        id = objectifyId(id);
        trace.log({ id });
    }
    if (!mainPage) {
        mainPage = '/';
    }
    let message = 'Deleting record';
    try {
        await collection.deleteOne({ id });
    }
    catch (err) {
        console.log(`Database error deleting Row ${id} in table ${table} `, err);
        message = 'Unexpected error 51';
    }
    output = `
      <h2>${message}</h2>
      <DIV CLASS="footerlinks">
     
       <button class="btn btn-primary" onclick="window.location='${mainPage}?table=${table}&mode=list'">${lang.tableList}</button>
           <button class="btn btn-primary" onclick="window.location='${mainPage}'">${lang.backToTables}</button>
    </DIV>
  `;
    return (output);
}
/**
 * Update one row in a table
 * @param {string} table
 * @param {object} record
 */
async function updateRow(table, record, subschemas, additionalAttributes) {
    trace.log({ inputs: arguments });
    const attributes = mergeAttributes(table, '', subschemas, additionalAttributes);
    const rec = fixWrite(table, record, attributes, 'update');
    const filter = { id: rec.id };
    try {
        const ref = database.collection(table).doc(rec.id);
        const res = await ref.update(rec);
        trace.log(res);
    }
    catch (err) {
        console.log(`Problem updating ${rec.id} in ${table}`, err);
    }
    trace.log({ op: 'update ', table, filter, record: rec });
}
/**
 * Get a set of rows from a table
 * @param {string} table
 * @param {object} spec - flter specification - see above
 * @param {number} offset
 * @param {} limit
 * @param {*} sortKey
 * @param {*} direction
 * @returns {array} Array of table row objects.
 */
async function getRows(table, spec, offset, limit, sortKey, direction) {
    trace.log({ input: arguments });
    const collection = database.collection(table);
    if (!limit && spec.limit) {
        limit = spec.limit;
    }
    let rows = [];
    const options = {};
    const instruction = {};
    const tableData = tableDataFunction(table);
    if (!sortKey && spec.sort) {
        sortKey = spec.sort[0];
    }
    if (!sortKey) {
        sortKey = tableData.primaryKey;
    }
    if (!direction && spec.sort) {
        direction = spec.sort[1];
    }
    if (!direction) {
        direction = 'DESC';
    }
    queryRef = spec.ref = getInstruction(table, spec);
    trace.log({ instruction: queryRef, limit, offset });
    /*
    if (sortKey) {
      let sortObj = {};
      trace.log({ direction: direction });
      if (direction == 'DESC') { sortObj[sortKey] = -1 } else { sortObj[sortKey] = 1 }
      options['sort'] = sortObj;
    }
    if (limit && limit != -1) {
      options['limit'] = limit;
    }
    if (offset) {
      options['skip'] = offset;
    }
  */
    try {
        trace.log('getting');
        snapshot = await queryRef.get();
        trace.log(snapshot);
        // console.log(snapshot.docs)
    }
    catch (err) {
        console.log(`Error reading ${table}

    ${err}`);
    }
    let i = 0;
    rows = [];
    snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
        rows[i] = doc.data();
        rows[i++].id = doc.id;
    });
    const attributes = rawAttributes(table);
    trace.log(attributes, { level: 'silly' });
    for (let i = 0; i < rows.length; i++) {
        fixRead(rows[i], attributes); // rows[i] is an object so only address is passed
        trace.log('fixed read', rows[i], { level: 'verbose' });
    }
    trace.log(rows);
    return (rows);
}
/**
 * Get a single row from the database
 * @param {string} table
 * @param {number} row to be selected - normally the primary key
 * @param {number} Optional - field to be searched if not the primary key
 * @returns {object} The row
 */
async function getRow(table, val, col) {
    trace.log({ inputs: arguments });
    const tableData = tableDataFunction(table);
    let spec;
    if (typeof val === 'object') {
        spec = val;
    }
    else {
        if (!col) {
            col = tableData.primaryKey;
        }
        ;
        trace.log(col, val);
        spec = { searches: [[col, 'eq', val]] };
    }
    trace.log(spec);
    const records = await getRows(table, spec);
    trace.log({ table, value: val, records });
    if (!records.length) {
        record = { err: 1, msg: 'Record not found' };
    }
    else {
        record = records[0];
    }
    trace.log('fixed read', record);
    return (record);
}
/**
 * Create new tables on the database according to the schema.
 * Only new tables are added. It's purpose is to do the heavy
 * lifting of setting up the database. Fine tuning you need to
 * use a different tool but make sure it is in syncwith the schema.
 * @param {object} req
 * @param {object} res
 * @returns {string} HTML listing the tables that have been added
 */
async function createTable(req, res) {
    // trace.log({ input: arguments });
    return ('not required for mongo');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlyZXN0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Jpbi9zdWRzL2RiZHJpdmVycy9maXJlc3RvcmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvREFzQm9EO0FBQ3BELE1BQU0sd0JBQXdCLEdBQUcsVUFBVSxDQUFBLENBQUMsbUNBQW1DO0FBRS9FLE9BQU8sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0FBQ3pCLE9BQU8sQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFBO0FBRWpDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO0FBQzdCLE9BQU8sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0FBQ3ZCLE9BQU8sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0FBQ3pCLE9BQU8sQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO0FBQzdCLE9BQU8sQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO0FBQzdCLE9BQU8sQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO0FBQzdCLE9BQU8sQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFBO0FBQy9CLE9BQU8sQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO0FBQzdCLE9BQU8sQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFBO0FBRXJDLE1BQU0sRUFBRSxhQUFhLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUE7QUFDakYsTUFBTSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEdBQUcsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUE7QUFDbkYsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGtDQUFrQyxDQUFDLENBQUE7QUFDdkQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUE7QUFDekMsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsY0FB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