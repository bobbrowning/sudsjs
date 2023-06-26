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
exports.getView = getView;
exports.getViewItem = getViewItem;
exports.countRows = countRows;
exports.totalRows = totalRows;
exports.createRow = createRow;
exports.deleteRow = deleteRow;
exports.deleteRows = deleteRows;
exports.updateRow = updateRow;
exports.standardiseId = standardiseId;
exports.stringifyId = stringifyId;
let trace = require('track-n-trace');
const suds = require('../../../config/suds');
const tableDataFunction = require('../table-data');
const mergeAttributes = require('../merge-attributes');
const lang = require('../../../config/language').EN;
const Nano = require('nano');
let nano;
const collection = suds.couch.collectionField;
const driverSubs = require('./driverSubs');
const rawAttributes = driverSubs.rawAttributes;
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
//  url: `http://${auth.couch.user}:${auth.couch.password}@localhost:5984`,
function connect() {
    const auth = require('../../../local/auth');
    suds.dbType = 'nosql';
    const dbSpec = suds[suds.dbDriver];
    trace.log(dbSpec);
    const authSpec = auth[suds.dbDriver];
    try {
        let authString = '';
        if (authSpec) {
            authString = `${authSpec.user}:${authSpec.password}@`;
        }
        const url = `http://${authString}${dbSpec.connection.host}`;
        trace.log(url);
        const opts = {
            url,
            requestDefaults: dbSpec.connection.requestDefaults
        };
        nano = Nano(opts);
        db = nano.db.use(dbSpec.connection.database);
        console.log('Connected to CouchDB database ');
    }
    catch (err) {
        throw new Error('Database connected failed ');
    }
    nano.db.list().then(function (list) {
        trace.log({ list });
        if (list.includes(dbSpec.connection.database)) {
            console.log(`Database ${dbSpec.connection.database} alive and well`);
        }
        else {
            throw new Error(`Couch system doesn't include ${dbSpec.connection.database}`, trace.line('s'));
        }
    });
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
 * Hangover from MongoDB - needs cleaning up...
 *
 * ******************************************** */
function stringifyId(id) {
    return id;
}
function objectifyId(id) {
    return id;
}
/** ******************************************
 *
 *        GET INSTRUCTION
 *
 * Create query object
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
    const attributes = mergeAttributes(table);
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
    query[collection] = table;
    if (spec.andor === 'or') {
        query = { $or: [] };
    }
    for (let i = 0; i < searches.length; i++) {
        let item = {};
        if (searches[i][0] == 'id')
            searches[i][0] = '_id';
        const searchField = searches[i][0];
        const compare = searches[i][1];
        let value = searches[i][2];
        let ta;
        const qfield = searchField;
        let path = [searchField];
        trace.log(searchField);
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
            if (!ta)
                throw (`No attributes for ${searchField}`);
        }
        if (ta.model || searchField === '_id') {
            value = objectifyId(value);
        }
        trace.log({ searchField, path, qfield, compare, value });
        //   insensitive = ''
        //   if (suds.caseInsensitive) { insensitive = 'i' }
        if (compare === 'startsWith' || compare === 'startswith') {
            const re = `${value}.*`;
            item = { $regex: re };
            //      continue;
        }
        if (compare === 'contains' || compare === 'like') {
            const re = `.*${value}.*`;
            item = { $regex: re };
            //     continue;
        }
        if (compare === 'equals' || compare === 'eq') {
            item = value;
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
        trace.log(spec);
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
async function fixWrite(table, record, attributes, mode) {
    trace.log({ table, record, mode, break: '+' });
    trace.log({ attributes, level: 'verbose' });
    const rec = {};
    for (const key of Object.keys(attributes)) {
        trace.log({ key, level: 'verbose' });
        trace.log(key, Array.isArray(record[key]), record[key], { level: 'verbose' });
        trace.log({
            key,
            type: attributes[key].type,
            array: attributes[key].array,
            collection: attributes[key][collection],
            val: record[key],
            num: Number(record[key]),
            isNan: isNaN(rec[key]),
            level: 'verbose'
        });
        /** *
         *
         *      Fix array - doesn't do much!
         * If this field is an array and the data is not - them ruen it into an aray
         * The 'single' array type is where we store an array as a Javascript object
         * rather than a real array. Hangover from SQL databases and unlileky yo be used
         * for Couch.
        */
        if (attributes[key].array) {
            if (attributes[key].array.type !== 'single') {
                trace.log(record[key], Array.isArray(record[key]), { level: 'verbose' });
                if (!Array.isArray(record[key])) {
                    if (record[key]) {
                        record[key] = [record[key]];
                    }
                    else {
                        record[key] = [];
                    }
                }
                /** start with an empty array
                 * If the elements of the array are objectes
                 * call itself recursively ti process the objects.
                 * otherwise just copy it.
                 *
                */
                rec[key] = [];
                trace.log(record[key]);
                for (let i = 0; i < record[key].length; i++) {
                    if (attributes[key].type === 'object' && record[key][i]) {
                        trace.log({ key, i, subrecord: record[key][i], level: 'verbose' });
                        rec[key][i] = await fixWrite(table, record[key][i], attributes[key].object, mode);
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
            /** * Not an array */
            trace.log(key, attributes[key].type, { level: 'verbose' });
            /** If this is an object call itself recursively until we get to a non-object  field */
            if (attributes[key].type === 'object' && record[key]) {
                trace.log('down a level', key, record[key]);
                rec[key] = await fixWrite(table, record[key], attributes[key].object, mode);
                trace.log(rec[key]);
            }
            else {
                //   if (!attributes[key]) { continue }   // skip field if not in database
                /** * Not an object or array */
                /** For new records, guarantee that they have every field */
                trace.log({ key, type: typeof record[key], level: 'verbose' });
                /** Make sure every field is there for new records */
                if (typeof record[key] === 'undefined' && mode === 'new') {
                    if (key === '_id') {
                        const uuids = await nano.uuids();
                        trace.log({ uuids });
                        record[key] = uuids.uuids[0];
                        trace.log({ id: record[key] });
                    }
                    else {
                        record[key] = null;
                    }
                }
                trace.log('final processing', {
                    level: 'verbose'
                });
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
        trace.log({ key, old: record[key], new: rec[key] }, { level: 'verbose' });
    }
    trace.log({ fixed: rec });
    return (rec);
}
/** ************************************************
 *
 * Fix any issues with the record read.
 *
 * *********************************************** */
function fixRead(record, attributes) {
    trace.log({ record: record, attributes: attributes, level: 's1' });
    if (record._id) {
        record._id = record._id.toString();
    }
    for (const key of Object.keys(record)) {
        trace.log({ key, data: record[key], level: 's1' });
        if (!attributes[key]) {
            continue;
        }
        ; // do nothing if item not in schema
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
                    if (!attributes[key].object && attributes[key].properties) {
                        attributes[key].object = attributes[key].properties;
                    }
                    fixRead(record[key][i], attributes[key].object);
                }
                if (attributes[key].model && record[key][i]) {
                    record[key][i] = record[key][i].toString();
                }
            }
        }
        else {
            trace.log({ type: attributes[key].type, key: record[key], level: 'verbose' });
            if (attributes[key].type === 'object' && record[key]) {
                fixRead(record[key], attributes[key].object);
            }
            else {
                trace.log({ model: attributes[key].model, data: record[key], level: 'verbose' });
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
 * As many CouchDB doesn't have a count function this simply
 * reads pagelength +1 records and returns the number read.
 *
 * @param {string} table - Table name
 * @param {Object} spec - Filter specification - see get instruction above.
 * @returns {number} Record count
 */
async function countRows(table, spec, offset) {
    trace.log({ input: arguments });
    const first = await getRows(table, spec, offset, suds.pageLength + 1);
    return (first.length);
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
    let result = 0;
    const records = getRows(table, spec);
    for (let i = 0; i < records.length; i++) {
        result += records[i][col];
    }
    return result;
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
    const rec = await fixWrite(table, record, attributes, 'new');
    for (const key of Object.keys(attributes)) {
        if (attributes[key].process.createdAt) {
            rec[key] = Date.now();
        }
        if (attributes[key].process.updatedAt) {
            rec[key] = Date.now();
        }
    }
    rec[collection] = table;
    delete rec._rev; // not valid for insert
    trace.log('inserting:', rec);
    try {
        const result = await db.insert(rec);
        rec._id = result.id;
        rec._rev = result.rev;
        trace.log(result, rec);
        trace.log(typeof (rec._id));
        return (rec);
    }
    catch (err) {
        console.log(`attempt to insert record in ${table} failed
    ${err} `);
        return (rec);
    }
}
/**
 * Delete Rows
 * @param {string} table
 * @param {object} spec - see above
 * @returns {string} HTML output
 */
async function deleteRows(table, spec) {
    trace.log({ input: arguments });
    const oldRows = getRows(table, spec);
    for (const row of oldRows) {
        deleteRow(table, row._id);
    }
    return ('done');
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
    let mainPage = suds.mainPage;
    if (typeof (id) === 'string') {
        id = objectifyId(id);
        trace.log({ id });
    }
    if (!mainPage) {
        mainPage = '/';
    }
    const message = 'Deleting record';
    let rec;
    let rev;
    try {
        rec = await db.get(id);
        rev = rec._rev;
        console.log('destroying', id, rev);
        await db.destroy(id, rev);
    }
    catch (err) {
        console.log(`Database error deleting Row ${id} in table ${table} - retrying `);
        try {
            rec = await db.get(id);
            rev = rec._rev;
            console.log('destroying (2)', id, rev);
            await db.destroy(id, rev);
        }
        catch {
            console.log(err);
            throw new Error('second try failed');
        }
    }
    const output = `
      <h2> ${message}</h2>
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
    let rec = await fixWrite(table, record, attributes, 'update');
    const filter = { _id: rec._id };
    if (!rec._id) {
        trace.log(rec);
        throw new Error('Attempt to update record - missing id');
    }
    try {
        /**
         * Read the existing record wu=itg that key
         * Replace items in the update
         * This becomes the new record.
         */
        const oldrec = await getRow(table, rec._id);
        for (const key of Object.keys(rec)) {
            if (key === '_rev')
                continue;
            oldrec[key] = rec[key];
        }
        rec = oldrec;
        trace.log(rec);
        const result = await db.insert(rec);
        trace.log(result);
    }
    catch (err) {
        console.log(`** warning ** Problem updating
    id: ${rec._id}
    rev: $rec._rev
  }
    retrying
    ${err} `);
        try {
            const oldrec = await getRow(table, rec._id);
            for (const key of Object.keys(rec)) {
                if (key === '_rev')
                    continue;
                oldrec[key] = rec[key];
            }
            rec = oldrec;
            const result = await db.insert(rec);
            trace.log(result);
        }
        catch (err) {
            console.log(`Problem updating ${rec._id} no update`, err);
        }
    }
    trace.log({ op: 'update ', table, filter, record: rec });
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
    let record;
    if (!val) {
        throw new Error(`couch.js::Attempt to read undefined record on ${table}`);
    }
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
    trace.log({ table: table, value: val, records: records });
    if (!records.length) {
        record = { err: 1, msg: 'record not found' };
    }
    else {
        record = records[0];
    }
    trace.log('fixed read', record);
    return (record);
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
    if (spec && spec.view)
        return (await getView(table, spec, offset, limit, sortKey, direction));
    if (!spec) {
        spec = {};
    }
    if (!limit && spec.limit) {
        limit = spec.limit;
    }
    let rows = {};
    let instruction = {};
    instruction[collection] = table;
    // const tableData = tableDataFunction(table)
    if (!sortKey && spec.sort) {
        sortKey = spec.sort[0];
    }
    //  if (!sortKey) { sortKey = tableData.primaryKey; }
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
    trace.log({
        instruction,
        limit,
        offset,
        direction,
        sortkey: sortKey
    });
    const options = { selector: instruction };
    if (sortKey) {
        const sortObj = {};
        trace.log({ direction });
        if (direction === 'DESC') {
            sortObj[sortKey] = 'desc';
        }
        else {
            sortObj[sortKey] = 'asc';
        }
        options.sort = [sortObj];
    }
    if (limit && limit !== -1) {
        options.limit = limit;
    }
    if (offset) {
        options.skip = offset;
    }
    trace.log(options);
    try {
        let startTime = new Date().getTime();
        trace.log({ where: 'Start of read', collection: table, options: options, level: 'timer' }); // timing
        const result = await db.find(options);
        rows = result.docs;
        trace.log({ records: rows.length, 'Elapsed time (ms)': new Date().getTime() - startTime, level: 'timer', });
    }
    catch (err) {
        trace.log(err);
        if (err.description.includes('No index exists for this sort,')) {
            const indexDef = { index: { fields: [sortKey] } };
            console.log(`Creating index for ${sortKey}`);
            await db.createIndex(indexDef);
            try {
                const result = await db.find(options);
                rows = result.docs;
            }
            catch (err) {
                console.log(`Error reading ${table} returning empty set.
        ${err} `);
                rows = [];
            }
        }
        else {
            console.log(`Error reading ${table} returning empty set.
    ${err} `);
            rows = [];
        }
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
 * Get a set of rows from a table
 * @param {string} table
 * @param {object} spec - flter specification - see above
 * @param {number} offset
 * @param {} limit
 * @param {*} sortKey
 * @param {*} direction
 * @returns {array} Array of table row objects.
 */
async function getView(table, spec, offset, limit, sortKey, direction) {
    trace.log({ input: arguments });
    if (!limit && spec.limit) {
        limit = spec.limit;
    }
    let options = {};
    if (spec.view.params) {
        options = spec.view.params;
    }
    if (spec && spec.searches && spec.searches.length) {
        if (spec.searches.length !== 1) {
            throw new Error('** Warning ** Searches on a view can only have one item');
        }
        else {
            if (typeof spec.view.key === 'string') {
                options.key = spec.searches[0][2];
            }
            else {
                options.startkey = [spec.searches[0][2], ''];
                options.endkey = [spec.searches[0][2], 'zzzzzzzzzzzzzz'];
            }
        }
    }
    /** sortkey doesn't apply and should not be used.  Use params instead... */
    if (!sortKey && spec.sort) {
        sortKey = spec.sort[0];
    }
    if (!direction && spec.sort) {
        direction = spec.sort[1];
    }
    if (direction && direction === 'DESC') {
        options.descending = true;
    }
    if (limit && limit !== -1) {
        options.limit = limit;
    }
    if (offset) {
        options.skip = offset;
    }
    trace.log(spec.view.design, spec.view.view, options);
    let startTime = new Date().getTime();
    trace.log({ where: 'Start of read', collection: table, options: options, level: 'timer' }); // timing
    const result = await db.view(spec.view.design, spec.view.view, options);
    trace.log({ records: result.rows.length, 'Elapsed time (ms)': new Date().getTime() - startTime, level: 'timer', });
    trace.log({ result });
    /** Loop through the results which are an bject containing id, key and value.
     * If the value is a string
     */
    let rows = fixViewResult(result, spec);
    trace.log(rows);
    const attributes = rawAttributes(table);
    trace.log(attributes, { level: 'silly' });
    for (let i = 0; i < rows.length; i++) {
        fixRead(rows[i], attributes); // rows[i] is an object so only address is passed
        trace.log('fixed read', rows[i], { level: 'verbose' });
    }
    return (rows);
}
function fixViewResult(result, spec) {
    trace.log({ result });
    let rows = [];
    /** Loop through the results which are an object containing id, key and value.
     *  Extrct the rows
     */
    for (let i = 0; i < result.rows.length; i++) {
        rows[i] = result.rows[i].value;
        if (spec.view.key) {
            if (typeof spec.view.key === 'string') {
                rows[i][spec.view.key] = result.rows[i].key;
            }
            else {
                for (let j = 0; j < spec.view.key.length; j++) {
                    rows[i][spec.view.key[j]] = result.rows[i].key[j];
                }
            }
        }
        rows[i]._id = rows[i].id = result.rows[i].id;
    }
    trace.log(rows);
    return rows;
}
/**
 * Get one item from a view given the key or keys
 * @param {string} design
 * @param {string} view
 * @param {string or array} id
 */
async function getViewItem(design, view, id) {
    if (typeof id === 'string') {
        id = [id];
    }
    const result = await db.view(design, view, { keys: id });
    let spec = {};
    let rows = fixViewResult(result, spec);
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
async function createTable() {
    // trace.log({ input: arguments });
    return ('not required for couch');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY291Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYmluL3N1ZHMvZGJkcml2ZXJzL2NvdWNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0RBb0JvRDs7QUFFcEQsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7QUFDekIsT0FBTyxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUE7QUFFakMsT0FBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7QUFDdkIsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7QUFDekIsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7QUFDekIsT0FBTyxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUE7QUFDakMsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDN0IsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDN0IsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDN0IsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDN0IsT0FBTyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7QUFDL0IsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDN0IsT0FBTyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUE7QUFDckMsT0FBTyxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUE7QUFFakMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBQ3BDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFBO0FBQzVDLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBQ2xELE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO0FBQ3RELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtBQUNuRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDNUIsSUFBSSxJQUFJLENBQUE7QUFDUixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQTtBQUM3QyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUE7QUFFMUMsTUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQTtBQUU5QyxJQUFJLEVBQUUsQ0FBQTtBQUNOOzs7Ozs7OzttREFRbUQ7QUFDbkQsMkVBQTJFO0FBRTNFLFNBQVMsT0FBTztJQUNkLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO0lBQzNDLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFBO0lBQ3JCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDbEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNqQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ3BDLElBQUk7UUFDRixJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUE7UUFDbkIsSUFBSSxRQUFRLEVBQUU7WUFBRSxVQUFVLEdBQUcsR0FBRyxRQUFRLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQyxRQUFRLEdBQUcsQ0FBQTtTQUFFO1FBQ3ZFLE1BQU0sR0FBRyxHQUFHLFVBQVUsVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUE7UUFDM0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNkLE1BQU0sSUFBSSxHQUFHO1lBQ1gsR0FBRztZQUNILGVBQWUsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLGVBQWU7U0FDbkQsQ0FBQTtRQUNELElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7UUFFakIsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDNUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFBO0tBQzlDO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDWixNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUE7S0FDOUM7SUFFRCxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FDakIsVUFBVSxJQUFJO1FBQ1osS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUE7UUFDbkIsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDN0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxpQkFBaUIsQ0FBQyxDQUFBO1NBQ3JFO2FBQU07WUFDTCxNQUFNLElBQUksS0FBSyxDQUFFLGdDQUFnQyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtTQUNoRztJQUNILENBQUMsQ0FDRixDQUFBO0FBQ0gsQ0FBQztBQUVEOzs7Ozs7a0RBTWtEO0FBQ2xELFNBQVMsYUFBYSxDQUFFLEVBQUU7SUFDeEIsT0FBTyxFQUFFLENBQUE7QUFDWCxDQUFDO0FBRUQ7Ozs7Ozs7O2tEQVFrRDtBQUVsRCxTQUFTLFdBQVcsQ0FBRSxFQUFFO0lBQ3RCLE9BQU8sRUFBRSxDQUFBO0FBQ1gsQ0FBQztBQUNELFNBQVMsV0FBVyxDQUFFLEVBQUU7SUFDdEIsT0FBTyxFQUFFLENBQUE7QUFDWCxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdCRztBQUVILFNBQVMsY0FBYyxDQUFFLEtBQUssRUFBRSxJQUFJO0lBQ2xDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQTtJQUUvQixNQUFNLFVBQVUsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDekMsdUNBQXVDO0lBQ3ZDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO1FBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7S0FBRTtJQUN2QyxvQkFBb0I7SUFDcEIsK0dBQStHO0lBQy9HLElBQUk7SUFDSixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUE7SUFDakIsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1FBQUUsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUE7S0FBRTtJQUMvQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO0lBRXRDLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQTtJQUNkLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxLQUFLLENBQUE7SUFDekIsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksRUFBRTtRQUFFLEtBQUssR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQTtLQUFFO0lBRWhELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3hDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQTtRQUNiLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUk7WUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFBO1FBQ2xELE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNsQyxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDOUIsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzFCLElBQUksRUFBRSxDQUFBO1FBQ04sTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFBO1FBQzFCLElBQUksSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDeEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUN0QixJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDN0IsS0FBSyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsV0FBVyxvQkFBb0IsQ0FBQyxDQUFBO1lBQ3JFLElBQUksR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQzdCLElBQUksSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUM5QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDcEMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQzNCLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO2FBQ3BCO1lBQ0QsRUFBRSxHQUFHLElBQUksQ0FBQTtZQUNULEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUE7U0FDZDthQUFNO1lBQ0wsRUFBRSxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQTtZQUM1QixJQUFJLENBQUMsRUFBRTtnQkFBRSxNQUFNLENBQUMscUJBQXFCLFdBQVcsRUFBRSxDQUFDLENBQUE7U0FDcEQ7UUFDRCxJQUFJLEVBQUUsQ0FBQyxLQUFLLElBQUksV0FBVyxLQUFLLEtBQUssRUFBRTtZQUNyQyxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFBO1NBQzNCO1FBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFBO1FBRXhELHFCQUFxQjtRQUNyQixvREFBb0Q7UUFDcEQsSUFBSSxPQUFPLEtBQUssWUFBWSxJQUFJLE9BQU8sS0FBSyxZQUFZLEVBQUU7WUFDeEQsTUFBTSxFQUFFLEdBQUcsR0FBRyxLQUFLLElBQUksQ0FBQTtZQUN2QixJQUFJLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUE7WUFDckIsaUJBQWlCO1NBQ2xCO1FBQ0QsSUFBSSxPQUFPLEtBQUssVUFBVSxJQUFJLE9BQU8sS0FBSyxNQUFNLEVBQUU7WUFDaEQsTUFBTSxFQUFFLEdBQUcsS0FBSyxLQUFLLElBQUksQ0FBQTtZQUN6QixJQUFJLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUE7WUFDckIsZ0JBQWdCO1NBQ2pCO1FBQ0QsSUFBSSxPQUFPLEtBQUssUUFBUSxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7WUFDNUMsSUFBSSxHQUFHLEtBQUssQ0FBQTtTQUNiO1FBQ0QsSUFBSSxPQUFPLEtBQUssTUFBTSxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7WUFBRSxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUE7U0FBRTtRQUNyRSxJQUFJLE9BQU8sS0FBSyxNQUFNLElBQUksT0FBTyxLQUFLLElBQUksRUFBRTtZQUFFLElBQUksR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQTtTQUFFO1FBQ3JFLElBQUksT0FBTyxLQUFLLElBQUksRUFBRTtZQUFFLElBQUksR0FBRyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQTtTQUFFO1FBQ2hELElBQUksT0FBTyxLQUFLLElBQUksRUFBRTtZQUFFLElBQUksR0FBRyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQTtTQUFFO1FBQ2hELElBQUksT0FBTyxLQUFLLElBQUksRUFBRTtZQUFFLElBQUksR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQTtTQUFFO1FBQy9DLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDZixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssS0FBSyxFQUFFO1lBQ3hCLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUE7U0FDckI7YUFBTTtZQUNMLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQTtZQUNmLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUE7WUFDbkIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDckI7S0FDRjtJQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7SUFDeEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ2hCLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0JHO0FBQ0gsS0FBSyxVQUFVLFFBQVEsQ0FBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxJQUFJO0lBQ3RELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQTtJQUM5QyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFBO0lBQzNDLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQTtJQUVkLEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtRQUN6QyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFBO1FBQ3BDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7UUFDN0UsS0FBSyxDQUFDLEdBQUcsQ0FBQztZQUNSLEdBQUc7WUFDSCxJQUFJLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUk7WUFDMUIsS0FBSyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLO1lBQzVCLFVBQVUsRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDO1lBQ3ZDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDO1lBQ2hCLEdBQUcsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLEtBQUssRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3RCLEtBQUssRUFBRSxTQUFTO1NBQ2pCLENBQUMsQ0FBQTtRQUVGOzs7Ozs7O1VBT0U7UUFFRixJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUU7WUFDekIsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7Z0JBQzNDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQTtnQkFDeEUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7b0JBQy9CLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUNmLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO3FCQUM1Qjt5QkFBTTt3QkFDTCxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO3FCQUNqQjtpQkFDRjtnQkFFRDs7Ozs7a0JBS0U7Z0JBQ0YsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtnQkFDYixLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO2dCQUN0QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDM0MsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7d0JBQ3ZELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7d0JBQ2xFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLFFBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUE7cUJBQ2xGO3lCQUFNO3dCQUNMLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7cUJBQzdCO2lCQUNGO2dCQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO2FBQ2pDO2lCQUFNO2dCQUNMLHFGQUFxRjtnQkFDckYsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTthQUN2QjtTQUNGO2FBQU07WUFDTCxxQkFBcUI7WUFDckIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFBO1lBQzFELHVGQUF1RjtZQUN2RixJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDcEQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO2dCQUMzQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFBO2dCQUMzRSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO2FBQ3BCO2lCQUFNO2dCQUNMLDBFQUEwRTtnQkFDMUUsK0JBQStCO2dCQUUvQiw0REFBNEQ7Z0JBRTVELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFBO2dCQUM5RCxxREFBcUQ7Z0JBQ3JELElBQUksT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssV0FBVyxJQUFJLElBQUksS0FBSyxLQUFLLEVBQUU7b0JBQ3hELElBQUksR0FBRyxLQUFLLEtBQUssRUFBRTt3QkFDakIsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUE7d0JBQ2hDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFBO3dCQUNwQixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTt3QkFDNUIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFBO3FCQUMvQjt5QkFBTTt3QkFDTCxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFBO3FCQUNuQjtpQkFDRjtnQkFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFO29CQUM1QixLQUFLLEVBQUUsU0FBUztpQkFFakIsQ0FBQyxDQUFBO2dCQUNGLElBQUksT0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssV0FBVyxFQUFFO29CQUN0QyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFBO29CQUN0QixJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO3dCQUNyQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO3dCQUM5QixJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTs0QkFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO3lCQUFFO3FCQUN0QztvQkFDRCxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUU7d0JBQ3pCLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFBRTs0QkFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO3lCQUFFO3FCQUN6RztvQkFDRCxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO3dCQUN0QyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTs0QkFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFBO3lCQUFFOzZCQUFNOzRCQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUE7eUJBQUU7cUJBQzVEO2lCQUNGO2FBQ0Y7U0FDRjtRQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQTtLQUMxRTtJQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQTtJQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDZCxDQUFDO0FBRUQ7Ozs7cURBSXFEO0FBQ3JELFNBQVMsT0FBTyxDQUFFLE1BQU0sRUFBRSxVQUFVO0lBQ2xDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUE7SUFDbEUsSUFBSSxNQUFNLENBQUMsR0FBRyxFQUFFO1FBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFBO0tBQUU7SUFDdEQsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQ3JDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtRQUNsRCxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQUUsU0FBUTtTQUFFO1FBQUEsQ0FBQyxDQUFDLG1DQUFtQztRQUN2RSxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUU7WUFDekIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtZQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtnQkFDL0IsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ2YsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7aUJBQzVCO3FCQUFNO29CQUNMLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7aUJBQ2pCO2FBQ0Y7WUFDRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDM0MsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ3ZELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO29CQUNoRCxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFO3dCQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQTtxQkFBRTtvQkFDbEgsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUE7aUJBQ2hEO2dCQUNELElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQzNDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUE7aUJBQzNDO2FBQ0Y7U0FDRjthQUFNO1lBQ0wsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7WUFDN0UsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3BELE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFBO2FBQzdDO2lCQUFNO2dCQUNMLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFBO2dCQUNoRixJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUN4QyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFBO29CQUNwQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7aUJBQ3hEO2FBQ0Y7U0FDRjtRQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQTtLQUN4RDtJQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDbkIsQ0FBQztBQUNEOzs7Ozs7Ozs7OztHQVdHO0FBQ0gsS0FBSyxVQUFVLFNBQVMsQ0FBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU07SUFDM0MsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFBO0lBQy9CLE1BQU0sS0FBSyxHQUFHLE1BQU0sT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDckUsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUN2QixDQUFDO0FBRUQ7Ozs7Ozs7Ozs7R0FVRztBQUNILEtBQUssVUFBVSxTQUFTLENBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHO0lBQ3hDLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQTtJQUNkLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDcEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFBRSxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0tBQUU7SUFDdEUsT0FBTyxNQUFNLENBQUE7QUFDZixDQUFDO0FBRUQ7Ozs7Ozs7Ozs7O0dBV0c7QUFFSCxLQUFLLFVBQVUsU0FBUyxDQUFFLEtBQUssRUFBRSxNQUFNO0lBQ3JDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQTtJQUNoQyxNQUFNLFVBQVUsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDekMsTUFBTSxHQUFHLEdBQUcsTUFBTSxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFDNUQsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1FBQ3pDLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUU7WUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO1NBQUU7UUFDaEUsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRTtZQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7U0FBRTtLQUNqRTtJQUNELEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxLQUFLLENBQUE7SUFDdkIsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFBLENBQUMsdUJBQXVCO0lBQ3ZDLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQzVCLElBQUk7UUFDRixNQUFNLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbkMsR0FBRyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFBO1FBQ25CLEdBQUcsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQTtRQUNyQixLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUN0QixLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUMzQixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUE7S0FDYjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsS0FBSztNQUM5QyxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQ1QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0tBQ2I7QUFDSCxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxLQUFLLFVBQVUsVUFBVSxDQUFFLEtBQUssRUFBRSxJQUFJO0lBQ3BDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQTtJQUMvQixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQ3BDLEtBQUssTUFBTSxHQUFHLElBQUksT0FBTyxFQUFFO1FBQ3pCLFNBQVMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0tBQzFCO0lBQ0QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ2pCLENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxLQUFLLFVBQVUsU0FBUyxDQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsRUFBRTtJQUM3QyxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0lBQ2hDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFBO0lBQ3JGLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUE7SUFDNUIsSUFBSSxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssUUFBUSxFQUFFO1FBQzVCLEVBQUUsR0FBRyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDcEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUE7S0FDbEI7SUFDRCxJQUFJLENBQUMsUUFBUSxFQUFFO1FBQUUsUUFBUSxHQUFHLEdBQUcsQ0FBQTtLQUFFO0lBQ2pDLE1BQU0sT0FBTyxHQUFHLGlCQUFpQixDQUFBO0lBQ2pDLElBQUksR0FBRyxDQUFBO0lBQ1AsSUFBSSxHQUFHLENBQUE7SUFDUCxJQUFJO1FBQ0YsR0FBRyxHQUFHLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUN0QixHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQTtRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUNsQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0tBQzFCO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLCtCQUErQixFQUFFLGFBQWEsS0FBSyxjQUFjLENBQUMsQ0FBQTtRQUM5RSxJQUFJO1lBQ0YsR0FBRyxHQUFHLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUN0QixHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQTtZQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFBO1lBQ3RDLE1BQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUE7U0FDMUI7UUFBQyxNQUFNO1lBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNoQixNQUFNLElBQUksS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUE7U0FDckM7S0FDRjtJQUNELE1BQU0sTUFBTSxHQUFHO2FBQ0osT0FBTzs7O3NFQUdrRCxRQUFRLFVBQVUsS0FBSyxnQkFBZ0IsSUFBSSxDQUFDLFNBQVM7c0VBQ3JELFFBQVEsTUFBTSxJQUFJLENBQUMsWUFBWTs7S0FFaEcsQ0FBQTtJQUNILE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNqQixDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILEtBQUssVUFBVSxTQUFTLENBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsb0JBQW9CO0lBQ3ZFLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQTtJQUNoQyxNQUFNLFVBQVUsR0FBRyxlQUFlLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsb0JBQW9CLENBQUMsQ0FBQTtJQUMvRSxJQUFJLEdBQUcsR0FBRyxNQUFNLFFBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUM3RCxNQUFNLE1BQU0sR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7SUFDL0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7UUFDWixLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2QsTUFBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFBO0tBQ3pEO0lBQ0QsSUFBSTtRQUNGOzs7O1dBSUc7UUFDSCxNQUFNLE1BQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzNDLEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNsQyxJQUFJLEdBQUcsS0FBSyxNQUFNO2dCQUFFLFNBQVE7WUFDNUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtTQUN2QjtRQUNELEdBQUcsR0FBRyxNQUFNLENBQUE7UUFDWixLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ2QsTUFBTSxNQUFNLEdBQUcsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ25DLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7S0FDbEI7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNaLE9BQU8sQ0FBQyxHQUFHLENBQUM7VUFDTixHQUFHLENBQUMsR0FBRzs7OztNQUlYLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDVCxJQUFJO1lBQ0YsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUMzQyxLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2xDLElBQUksR0FBRyxLQUFLLE1BQU07b0JBQUUsU0FBUTtnQkFDNUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTthQUN2QjtZQUNELEdBQUcsR0FBRyxNQUFNLENBQUE7WUFDWixNQUFNLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDbkMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtTQUNsQjtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsR0FBRyxDQUFDLEdBQUcsWUFBWSxFQUFFLEdBQUcsQ0FBQyxDQUFBO1NBQzFEO0tBQ0Y7SUFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFBO0FBQzFELENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxLQUFLLFVBQVUsTUFBTSxDQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRztJQUNwQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7SUFDaEMsSUFBSSxNQUFNLENBQUE7SUFDVixJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ1IsTUFBTSxJQUFJLEtBQUssQ0FBQyxpREFBaUQsS0FBSyxFQUFFLENBQUMsQ0FBQTtLQUMxRTtJQUVELE1BQU0sU0FBUyxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzFDLElBQUksSUFBSSxDQUFBO0lBQ1IsSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUU7UUFDM0IsSUFBSSxHQUFHLEdBQUcsQ0FBQTtLQUNYO1NBQU07UUFDTCxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQUUsR0FBRyxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUE7U0FBRTtRQUFBLENBQUM7UUFDekMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDbkIsSUFBSSxHQUFHLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtLQUN4QztJQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDZixNQUFNLE9BQU8sR0FBRyxNQUFNLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDMUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUN2RCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtRQUNsQixNQUFNLEdBQUMsRUFBQyxHQUFHLEVBQUMsQ0FBQyxFQUFDLEdBQUcsRUFBQyxrQkFBa0IsRUFBQyxDQUFBO0tBQ3ZDO1NBQU07UUFDTCxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ3BCO0lBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUE7SUFDL0IsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQ2pCLENBQUM7QUFFRDs7Ozs7Ozs7O0dBU0c7QUFDSCxLQUFLLFVBQVUsT0FBTyxDQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsU0FBUztJQUNwRSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7SUFDL0IsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLElBQUk7UUFBRSxPQUFPLENBQUMsTUFBTSxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFBO0lBQzdGLElBQUksQ0FBQyxJQUFJLEVBQUU7UUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFBO0tBQUU7SUFDeEIsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO1FBQUUsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUE7S0FBRTtJQUNoRCxJQUFJLElBQUksR0FBRyxFQUFFLENBQUE7SUFDYixJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUE7SUFDcEIsV0FBVyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEtBQUssQ0FBQTtJQUMvQiw2Q0FBNkM7SUFDN0MsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQUUsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBRTtJQUNyRCxxREFBcUQ7SUFDckQsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQUUsU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBRTtJQUN6RCxJQUFJLENBQUMsU0FBUyxFQUFFO1FBQUUsU0FBUyxHQUFHLE1BQU0sQ0FBQTtLQUFFO0lBQ3RDLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7UUFDakQsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDckIsSUFBSSxDQUFDLFdBQVcsR0FBRyxjQUFjLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFBO1NBQy9DO1FBQ0QsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUE7S0FDL0I7SUFDRCxLQUFLLENBQUMsR0FBRyxDQUFDO1FBQ1IsV0FBVztRQUNYLEtBQUs7UUFDTCxNQUFNO1FBQ04sU0FBUztRQUNULE9BQU8sRUFBRSxPQUFPO0tBQ2pCLENBQUMsQ0FBQTtJQUNGLE1BQU0sT0FBTyxHQUFHLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxDQUFBO0lBQ3pDLElBQUksT0FBTyxFQUFFO1FBQ1gsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFBO1FBQ2xCLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFBO1FBQ3hCLElBQUksU0FBUyxLQUFLLE1BQU0sRUFBRTtZQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxNQUFNLENBQUE7U0FBRTthQUFNO1lBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQTtTQUFFO1FBQ3pGLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtLQUN6QjtJQUNELElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsRUFBRTtRQUN6QixPQUFPLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtLQUN0QjtJQUNELElBQUksTUFBTSxFQUFFO1FBQ1YsT0FBTyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUE7S0FDdEI7SUFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ2xCLElBQUk7UUFDRixJQUFJLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFBO1FBQ3BDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsZUFBZSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQSxDQUFDLFNBQVM7UUFDcEcsTUFBTSxNQUFNLEdBQUcsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ3JDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFBO1FBQ2xCLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxtQkFBbUIsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLFNBQVMsRUFBRSxLQUFLLEVBQUUsT0FBTyxHQUFHLENBQUMsQ0FBQTtLQUM1RztJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1osS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNkLElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsZ0NBQWdDLENBQUMsRUFBRTtZQUM5RCxNQUFNLFFBQVEsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQTtZQUNqRCxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixPQUFPLEVBQUUsQ0FBQyxDQUFBO1lBQzVDLE1BQU0sRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUM5QixJQUFJO2dCQUNGLE1BQU0sTUFBTSxHQUFHLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtnQkFDckMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUE7YUFDbkI7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDWixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixLQUFLO1VBQ2hDLEdBQUcsR0FBRyxDQUFDLENBQUE7Z0JBQ1QsSUFBSSxHQUFHLEVBQUUsQ0FBQTthQUNWO1NBQ0Y7YUFBTTtZQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEtBQUs7TUFDbEMsR0FBRyxHQUFHLENBQUMsQ0FBQTtZQUNQLElBQUksR0FBRyxFQUFFLENBQUE7U0FDVjtLQUNGO0lBQ0QsdUhBQXVIO0lBRXZILEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDZixNQUFNLFVBQVUsR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDdkMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUN6QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNwQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFBLENBQUMsaURBQWlEO1FBQzlFLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFBO0tBQ3ZEO0lBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ2YsQ0FBQztBQUVEOzs7Ozs7Ozs7R0FTRztBQUNILEtBQUssVUFBVSxPQUFPLENBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxTQUFTO0lBQ3BFLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQTtJQUMvQixJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7UUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQTtLQUFFO0lBQ2hELElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQTtJQUNoQixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQUUsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFBO0tBQUU7SUFFcEQsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtRQUNqRCxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUM5QixNQUFNLElBQUksS0FBSyxDQUFDLHlEQUF5RCxDQUFDLENBQUE7U0FDM0U7YUFBTTtZQUNMLElBQUksT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxRQUFRLEVBQUU7Z0JBQ3JDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTthQUNsQztpQkFBTTtnQkFDTCxPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtnQkFDNUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQTthQUN6RDtTQUNGO0tBQ0Y7SUFDRCwyRUFBMkU7SUFDM0UsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQUUsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBRTtJQUNyRCxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7UUFBRSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUFFO0lBQ3pELElBQUksU0FBUyxJQUFJLFNBQVMsS0FBSyxNQUFNLEVBQUU7UUFBRSxPQUFPLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQTtLQUFFO0lBRXBFLElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsRUFBRTtRQUN6QixPQUFPLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtLQUN0QjtJQUNELElBQUksTUFBTSxFQUFFO1FBQ1YsT0FBTyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUE7S0FDdEI7SUFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0lBQ3BELElBQUksU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDcEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFBLENBQUMsU0FBUztJQUNwRyxNQUFNLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFDdkUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxtQkFBbUIsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLFNBQVMsRUFBRSxLQUFLLEVBQUUsT0FBTyxHQUFHLENBQUMsQ0FBQTtJQUNsSCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQTtJQUNyQjs7T0FFRztJQUNILElBQUksSUFBSSxHQUFHLGFBQWEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDdEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUVmLE1BQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUN2QyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFBO0lBQ3pDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3BDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUEsQ0FBQyxpREFBaUQ7UUFDOUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7S0FDdkQ7SUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDZixDQUFDO0FBRUQsU0FBUyxhQUFhLENBQUUsTUFBTSxFQUFFLElBQUk7SUFDbEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUE7SUFDckIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFBO0lBQ2I7O09BRUc7SUFDSCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDM0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFBO1FBQzlCLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDakIsSUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLFFBQVEsRUFBRTtnQkFDckMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUE7YUFDNUM7aUJBQU07Z0JBQ0wsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDN0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7aUJBQ2xEO2FBQ0Y7U0FDRjtRQUNELElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtLQUM3QztJQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDZixPQUFPLElBQUksQ0FBQztBQUNkLENBQUM7QUFHRDs7Ozs7R0FLRztBQUNILEtBQUssVUFBVSxXQUFXLENBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFO0lBQzFDLElBQUksT0FBTyxFQUFFLEtBQUssUUFBUSxFQUFFO1FBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUE7S0FBRTtJQUN6QyxNQUFNLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ3hELElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQTtJQUNiLElBQUksSUFBSSxHQUFHLGFBQWEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFFeEMsQ0FBQztBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsS0FBSyxVQUFVLFdBQVc7SUFDeEIsbUNBQW1DO0lBQ25DLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFBO0FBQ25DLENBQUMifQ==