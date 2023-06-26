"use strict";
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
 *
 * ********************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.stringifyId = stringifyId;
const trace = require('track-n-trace');
const suds = require('../../../config/suds');
const tableDataFunction = require('../table-data');
const mergeAttributes = require('../merge-attributes');
const lang = require('../../../config/language').EN;
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
let database;
let client;
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
    trace.log(suds.mongo.connection.host);
    const auth = require('../../../local/auth');
    let authString = '';
    if (auth.mongo) {
        authString = `${auth.mongo.user}:${auth.mongo.password}@`;
    }
    let url = `mongodb://${authString}${suds.mongo.connection.host}`;
    let first = true;
    trace.log(Object.keys(suds.mongo.connection));
    for (const option of Object.keys(suds.mongo.connection)) {
        if (option === 'host')
            continue;
        if (option === 'database')
            continue;
        if (first) {
            url += '/?';
        }
        else {
            url += '&';
        }
        url += `${option}=${suds.mongo.connection[option]}`;
        first = false;
    }
    trace.log(url);
    client = new MongoClient(url);
    database = client.db(suds.mongo.connection.database);
    suds.dbType = 'nosql';
    try {
        await client.connect();
        // Establish and verify connection
        console.log('Connected to MongoDB database server');
        await client.db('admin').command({ ping: 1 });
        console.log('MongoDB database alive and well');
    }
    catch (err) {
        console.log('Database connected failed', err);
        process.exit(Number(trace.line()));
    }
}
/**
 *
 * Quick attributes object without any processing
 * @param {string} table
 * @returns
 */
function rawAttributes(table) {
    const tableData = require('../../../tables/' + table);
    let standardHeader = {};
    if (tableData.standardHeader) {
        standardHeader = require('../../../config/standard-header')[suds[suds.dbDriver].standardHeader];
    }
    const combined = { ...standardHeader, ...tableData.attributes };
    return (combined);
}
/** *********************************************
 *
 * Given a representation of the record key, returns
 * the standard format. Not convinced this is used!
 * @param {undefined} Record key
 *
 * ******************************************** */
function standardiseId(id) {
    return objectifyId(id);
}
/** *********************************************
 *
 * Given a representation of the record key, returns
 * the format that can be passed in a URL
 * @param {undefined} Record key
 *
 * ******************************************** */
function stringifyId(id) {
    let value;
    if (suds[suds.dbDriver].dbDriverKey === 'objectId') {
        value = id.toString();
    }
    else {
        value = id;
    }
    return value;
}
/**
 *
 * @param {*} id record key - normally string.
 * @returns Object representation of the record key
 */
function objectifyId(id) {
    let value;
    if (suds.mongo.dbDriverKey === 'objectId') {
        try {
            value = ObjectId(id);
        }
        catch (err) {
            value = '000000000000'; // valid but won't return anything
            trace.error(`
      id: ${id},
      Error: ${err}`);
        }
    }
    else {
        value = id;
    }
    trace.log(value);
    return value;
}
/** ******************************************
 *
 *        GET INSTRUCTION
 *
 * Turns a search specification into an
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
 * @returns {array}  Query object
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
    //   spec.sort = [Object.keys(tableData.attributes)[0], 'DESC']  // sort defaults to first field (normally ID)
    // }
    let searches = [];
    if (spec.searches) {
        searches = spec.searches;
    }
    trace.log({ searches: spec.searches });
    let query = {};
    if (spec.andor === 'or') {
        query = { $or: [] };
    }
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
        if (ta.model || searchField === '_id') {
            value = objectifyId(value);
        }
        trace.log({ searchField, path, qfield, compare, value });
        let insensitive = '';
        if (suds.caseInsensitive) {
            insensitive = 'i';
        }
        if (compare === 'startsWith' || compare === 'startswith') {
            const re = new RegExp(`${value}.*`, insensitive);
            item = { $regex: re };
            //      continue;
        }
        if (compare === 'contains' || compare === 'like') {
            const re = new RegExp(`.*${value}.*`, insensitive);
            item = { $regex: re };
            //     continue;
        }
        if (compare === 'equals' || compare === 'eq') {
            if (typeof value === 'string' && suds.caseInsensitive) {
                /* Make it case insensitive */
                const re = new RegExp(`^${value}$`, 'i');
                item = { $regex: re };
            }
            else {
                item = value;
            }
        }
        if (compare === 'less' || compare === 'lt') {
            item = { $lt: value };
        }
        if (compare === 'more' || compare === 'gt') {
            item = { $gt: value };
        }
        if (compare === 'le') {
            item = { $lte: value };
        }
        if (compare === 'ge') {
            item = { $gte: value };
        }
        if (compare === 'ne') {
            item = { $ne: value };
        }
        if (spec.andor === 'and') {
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
    const rec = {};
    if (record._id && typeof (record._id) === 'string' && mode !== 'new') {
        rec._id = objectifyId(record._id);
        trace.log({ id: rec._id });
    }
    for (const key of Object.keys(attributes)) {
        trace.log(key);
        if (attributes[key].collection) {
            continue;
        } // Not a real field
        if (key === '_id') {
            continue;
        } // Done already
        trace.log(key, Array.isArray(record[key]), record[key]);
        if (attributes[key].array &&
            attributes[key].array.type !== 'single' &&
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
            if (attributes[key].array.type !== 'single') {
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
                    if (attributes[key].type === 'object' && record[key][i]) {
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
            if (attributes[key].type === 'object' && record[key]) {
                trace.log('down a level', key, record[key]);
                rec[key] = fixWrite(table, record[key], attributes[key].object, mode);
                trace.log(rec[key]);
            }
            else {
                //   if (!attributes[key]) { continue }   // skip field if not in database
                /** For new records, guarantee that they have every field */
                trace.log(typeof record[key]);
                if (typeof record[key] === 'undefined' && mode === 'new') {
                    record[key] = null;
                }
                trace.log('final processing');
                if (typeof record[key] !== 'undefined') {
                    rec[key] = record[key];
                    if (attributes[key].type === 'number') {
                        rec[key] = Number(record[key]);
                        if (isNaN(rec[key])) {
                            rec[key] = 0;
                        }
                    }
                    if (attributes[key].model) {
                        if (rec[key] && rec[key] !== '0' && typeof (rec[key]) === 'string') {
                            rec[key] = objectifyId(rec[key]);
                        }
                    }
                    if (attributes[key].type === 'boolean') {
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
 * Change ObjectId to string.  OUtside this module SUDSJS
 * treats the record key as a string. It is converted to an
 * object before writing.
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
        } // do nothing if item not in schema
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
                if (attributes[key].type === 'object' && record[key][i]) {
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
            if (attributes[key].type === 'object' && record[key]) {
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
    let output = '';
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
    trace.log({ start: 'Delete table row', inputs: arguments, break: '#', level: 'min' });
    const collection = database.collection(table);
    let mainPage = suds.mainPage;
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
    const output = `
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
        if (direction === 'DESC') {
            sortObj[sortKey] = -1;
        }
        else {
            sortObj[sortKey] = 1;
        }
        options.sort = sortObj;
    }
    if (limit && limit !== -1) {
        options.limit = limit;
    }
    if (offset) {
        options.skip = offset;
    }
    trace.log(instruction, options);
    try {
        let startTime = new Date().getTime();
        trace.log({ where: 'Start of read', collection: table, instruction: instruction, level: 'timer' }); // timing
        rows = await collection.find(instruction, options).toArray();
        trace.log({ records: rows.length, 'Elapsed time (ms)': new Date().getTime() - startTime, level: 'timer', });
        trace.log({ instruction, options, rows });
    }
    catch (err) {
        console.log(`Error reading ${table} returning empty set.  
    ${err}`);
        rows = [];
    }
    //    rows = await knex(table).whereRaw(instruction, bindings).orderBy(sortKey, direction).offset(offset).limit(limit);
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
    let records = [];
    let record;
    const tableData = tableDataFunction(table);
    if (typeof val === 'object' && suds[suds.dbDriver].dbDriverKey === 'objectId') {
        val = val.toString();
    }
    if (typeof val === 'object') {
        records = await getRows(table, val);
    }
    else {
        if (!col) {
            col = tableData.primaryKey;
        }
        if (col === '_id' && typeof val === 'string' && val.length === 24) {
            val = objectifyId(val);
        }
        trace.log(col, val);
        const instruction = {};
        instruction[col] = val;
        const collection = database.collection(table);
        trace.log(table, instruction, await collection.countDocuments());
        records = await collection.find(instruction).toArray();
    }
    trace.log({ collection: table, field: col, value: val, records });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uZ28uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYmluL3N1ZHMvZGJkcml2ZXJzL21vbmdvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0RBb0JvRDs7QUFFcEQsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7QUFDekIsT0FBTyxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUE7QUFFakMsT0FBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7QUFDdkIsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7QUFDekIsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDN0IsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDN0IsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDN0IsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDN0IsT0FBTyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7QUFDL0IsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDN0IsT0FBTyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUE7QUFDckMsT0FBTyxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUE7QUFDakMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBQ3RDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0FBQzVDLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBQ2xELE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO0FBQ3RELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtBQUNuRCxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsV0FBVyxDQUFBO0FBQ2xE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