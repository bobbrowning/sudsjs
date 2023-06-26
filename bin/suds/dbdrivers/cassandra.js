"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** *********************************************
 * Mongodb database driver.
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
const Generic_Database__Driver = 'cassandra'; // To make documentation.js work...
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
let trace = require('../../node_modules/track-n-trace');
const suds = require('../../config/suds');
const tableDataFunction = require('./table-data');
const mergeAttributes = require('./merge-attributes');
const lang = require('../../config/language').EN;
const cassandra = require('cassandra-driver');
const ObjectId = require('mongodb').ObjectId;
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
    const conf = suds.database.clientData;
    conf.authProvider = new cassandra.auth.PlainTextAuthProvider(suds.database.auth.user, suds.database.auth.password);
    globalThis.client = new cassandra.Client(conf);
    suds.dbType = 'nosql';
    try {
        await client.connect();
        // Establish and verify connection
        console.log('Connected successfully to Cassandra database server');
    }
    catch (err) {
        console.log('Database connected failed', err);
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
 * Turns a search specification into an sql search and bindings
 * Won't work with MONGO
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
 * @returns {array}  instruction + bindings
 *
 */
function getInstruction(table, spec) {
    trace.log({ input: arguments });
    const attributes = rawAttributes(table);
    /* Rationalise the searchspec object */
    if (!spec.andor) {
        spec.andor = 'and';
    }
    // if (!spec.sort) {
    //   spec.sort = [Object.keys(tableData.attributes)[0], 'DESC'];  // sort defaults to first field (normally ID)
    // }
    let searches = [];
    if (spec.searches) {
        searches = spec.searches;
    }
    trace.log({ searches: spec.searches });
    let query = {};
    if (spec.andor == 'or') {
        query = { $or: [] };
    }
    const b = 0;
    for (let i = 0; i < searches.length; i++) {
        let item = {};
        const searchField = searches[i][0];
        const compare = searches[i][1];
        let value = searches[i][2];
        let ta;
        const qfield = searchField;
        let path = [searchField];
        if (searchField.includes('.')) {
            trace.log(`*********************** ${searchField} *****************`);
            path = searchField.split('.');
            let step = attributes[path[0]];
            for (let j = 1; j < path.length; j++) {
                step = step.object[path[j]];
                trace.log({ step });
            }
            ta = step;
            trace.log(ta);
        }
        else {
            ta = attributes[searchField];
        }
        if (ta.model || searchField == '_id') {
            value = objectifyId(value);
        }
        trace.log({ searchField, path, qfield, compare, value });
        insensitive = '';
        if (suds.caseInsensitive) {
            insensitive = 'i';
        }
        if (compare == 'startsWith' || compare == 'startswith') {
            const re = new RegExp(`${value}.*`, insensitive);
            item = { $regex: re };
            //      continue;
        }
        if (compare == 'contains' || compare == 'like') {
            const re = new RegExp(`.*${value}.*`, insensitive);
            item = { $regex: re };
            //     continue;
        }
        if (compare == 'equals' || compare == 'eq') {
            if (typeof value === 'string' && suds.caseInsensitive) {
                /* Make it case insensitive */
                const re = new RegExp(`^${value}$`, 'i');
                item = { $regex: re };
            }
            else {
                item = value;
            }
        }
        if (compare == 'less' || compare == 'lt') {
            item = { $lt: value };
        }
        if (compare == 'more' || compare == 'gt') {
            item = { $gt: value };
        }
        if (compare == 'le') {
            item = { $lte: value };
        }
        if (compare == 'ge') {
            item = { $gte: value };
        }
        if (compare == 'ne') {
            item = { $ne: value };
        }
        if (spec.andor == 'and') {
            query[qfield] = item;
        }
        else {
            const cond = {};
            cond[qfield] = item;
            query.$or.push(cond);
        }
    }
    trace.log({ table, instruction: query });
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
    if (record._id && typeof (record._id) === 'string' && mode != 'new') {
        rec._id = objectifyId(record._id);
        trace.log({ id: rec._id });
    }
    for (const key of Object.keys(attributes)) {
        trace.log(key);
        if (attributes[key].collection) {
            continue;
        } // Not a real field
        if (key == '_id') {
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
    if (record._id) {
        record._id = record._id.toString();
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
 *
 * Count Rows
 *
 * Counts the number of rows given a filter specification (see above)
 *
 * @param {string} table - Table name
 * @param {Object} spec - Filter specification - see get instruction above.
 * @returns {number} Record count
 */
async function countRows(table, spec) {
    trace.log({ input: arguments });
    const collection = database.collection(table);
    let count = 0;
    let query = {};
    if (spec) {
        query = getInstruction(table, spec);
    }
    trace.log({ table, instruction: query });
    try {
        count = await collection.countDocuments(query);
    }
    catch (err) {
        console.log(err);
    }
    trace.log({ count });
    return (count);
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
                    _id: null,
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
    const collection = database.collection(table);
    const result = await collection.insertOne(rec);
    trace.log(result, rec);
    trace.log(typeof (rec._id));
    return (rec);
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
        await collection.deleteOne({ _id: id });
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
    const collection = database.collection(table);
    const attributes = mergeAttributes(table, '', subschemas, additionalAttributes);
    const rec = fixWrite(table, record, attributes, 'update');
    const filter = { _id: rec._id };
    try {
        await collection.updateOne(filter, { $set: rec });
    }
    catch (err) {
        console.log(`Problem updating ${rec._id}`, err);
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
    let rows = {};
    const options = {};
    let instruction = {};
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
    if (spec && spec.searches && spec.searches.length) {
        if (!spec.instruction) {
            spec.instruction = getInstruction(table, spec);
        }
        instruction = spec.instruction;
    }
    trace.log({ instruction, limit, offset });
    if (sortKey) {
        const sortObj = {};
        trace.log({ direction });
        if (direction == 'DESC') {
            sortObj[sortKey] = -1;
        }
        else {
            sortObj[sortKey] = 1;
        }
        options.sort = sortObj;
    }
    if (limit && limit != -1) {
        options.limit = limit;
    }
    if (offset) {
        options.skip = offset;
    }
    trace.log(instruction, options);
    try {
        rows = await collection.find(instruction, options).toArray();
    }
    catch (err) {
        console.err(`Error reading ${table} returning empty set.  
    ${err}`);
        rows = [];
    }
    //    rows = await knex(table).whereRaw(instruction, bindings).orderBy(sortKey, direction).offset(offset).limit(limit);
    trace.log(rows);
    const attributes = rawAttributes(table);
    trace.log(attributes, { level: 'silly' });
    for (let i = 0; i < rows.length; i++) {
        fixRead(rows[i], attributes); // rows[i] is an object so only address is passed
        trace.log('fixed read', rows[i], { level: 'verbose' });
    }
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
        if (col == '_id' && typeof val === 'string' && val.length == 12) {
            val = objectifyId(val);
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2Fzc2FuZHJhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Jpbi9zdWRzL2RiZHJpdmVycy9jYXNzYW5kcmEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29EQXFCb0Q7QUFDcEQsTUFBTSx3QkFBd0IsR0FBRyxXQUFXLENBQUEsQ0FBQyxtQ0FBbUM7QUFFaEYsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7QUFDekIsT0FBTyxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUE7QUFFakMsT0FBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7QUFDdkIsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7QUFDekIsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDN0IsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDN0IsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDN0IsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDN0IsT0FBTyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7QUFDL0IsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDN0IsT0FBTyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUE7QUFFckMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGtDQUFrQyxDQUFDLENBQUE7QUFDdkQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUE7QUFDekMsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUE7QUFDakQsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUE7QUFDckQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUMsRUFBRSxDQUFBO0FBQ2hELE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FB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