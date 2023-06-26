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
// exports.connect=connect;
let trace = require('track-n-trace');
const suds = require('../../../config/suds');
const tableDataFunction = require('../table-data');
const mergeAttributes = require('../merge-attributes');
const lang = require('../../../config/language').EN;
const driverSubs = require('./driverSubs');
const rawAttributes = driverSubs.rawAttributes;
// let knex=require('knex');
/** *********************************************
 *
 * Given a representation of the record key, returns
 * the standard format. (in this case integer)
 * @param {undefined} Record key
 *
 * ******************************************** */
function standardiseId(id) {
    if (typeof (id) === 'number') {
        return id;
    }
    else {
        return parseInt(id);
    }
}
/** *********************************************
 *
 * Given a representation of the record key, returns
 * the format that can be passed in a URL. Only
 * relevant for MongoDB databases, so just returns
 * the value.
 * @param {undefined} Record key
 *
 * ******************************************** */
function stringifyId(id) {
    return id;
}
/**
 *
 * Quick attributes object without any processing
 * @param {string} table
 * @returns
 */
/** ******************************************
 *
 *        GET INSTRUCTION
 *
 * Turns a search specification into an sql search and bindings
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
    const tableData = require('../../../tables/' + table);
    trace.log({ tableData, level: 'verbose' });
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
    let instruction = '';
    const bindings = [];
    let b = 0;
    for (let i = 0; i < searches.length; i++) {
        if (i > 0) {
            instruction += ` ${spec.andor} `;
        }
        const searchField = searches[i][0];
        const compare = searches[i][1];
        let value = searches[i][2];
        let qfield = searchField;
        if (suds[suds.dbDriver].qualifyColName) {
            qfield = table + '.' + searchField;
        }
        if (suds[suds.dbDriver].quoteColName) {
            qfield = `"${qfield}"`;
        }
        trace.log({ table, searchField, qfield, compare, value });
        /* OK this is a kludge.  But sometimes you want to allow people to search by */
        /*  a string field and/or a numeric field. This doesn't work because         */
        /*  you end up testing a numeric field against a string.  99% of the time    */
        /*  people are trying to find a product or person or something either by     */
        /*  name or ID.  ('enter product name or number') - that is my excuse anyway */
        /*  Only a problem if primary key is integer, and that only hahhens for sql. */
        /*  If your primary key isn't 'id' you wil need to do some work.             */
        if (searchField == 'id' && !Number.isInteger(Number(value))) {
            continue;
        }
        if (compare == 'startsWith' || compare == 'startswith') {
            instruction += `${qfield} like ?`;
            bindings[b++] = `${value}%`;
            trace.log(b - 1, compare, value, instruction, bindings);
            continue;
        }
        if (compare == 'contains') {
            instruction += `${qfield} like ?`;
            bindings[b++] = `%${value}%`;
            trace.log(b - 1, compare, value, instruction, bindings);
            continue;
        }
        trace.log(searchField);
        const attributes = mergeAttributes(table);
        bindings[b++] = value;
        if (compare == 'like') {
            instruction += `${qfield} like ?`;
        }
        if (attributes[searchField].type == 'string') {
            value = '"' + value + '"';
        }
        if (compare == 'equals' || compare == 'eq') {
            instruction += `${qfield} = ?`;
        }
        if (compare == 'less' || compare == 'lt') {
            instruction += `${qfield} < ?`;
        }
        if (compare == 'more' || compare == 'gt') {
            instruction += `${qfield} > ?`;
        }
        if (compare == 'le') {
            instruction += `${qfield} <= ?`;
        }
        if (compare == 'ge') {
            instruction += `${qfield} >= ?`;
        }
        if (compare == 'ne') {
            instruction += `${qfield} <> ?`;
        }
        trace.log(b - 1, compare, value, instruction, bindings);
    }
    trace.log({ instruction, bindings });
    return ([instruction, bindings]);
}
/**
 *
 *           FIX RECORD
 *
 * Try and ensure the record is database-ready
 * Makes sure numeric fields are numeric and boolean fields are boolean
 * Yeah I know wouldn't be necessary with Typescript.
 *
 * @param {string} table - Table name
 * @param {object} record
 * @param {object} tableData - Table data from the schema
 * @param {object} attributes - extended attributes for each columns from the schema.
 * @returns {object} record - cloned
 *
 */
function fixRecord(table, record, tableData, attributes) {
    trace.log({ inputs: arguments });
    const rec = {};
    for (const key of Object.keys(record)) {
        if (!attributes[key]) {
            continue;
        } // skip field if not in database
        if (attributes[key].collection) {
            continue;
        } //  ""     ""
        trace.log({ key, type: attributes[key].type, val: record[key], num: Number(record[key]), isNan: isNaN(rec[key]) });
        rec[key] = record[key];
        if (attributes[key].type == 'number') {
            rec[key] = Number(record[key]);
            if (isNaN(rec[key])) {
                rec[key] = 0;
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
    trace.log('fixed:', rec);
    return (rec);
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
    let countobj = {};
    const tableData = require('../../../tables/' + table);
    if (spec && spec.searches && spec.searches.length) {
        if (!spec.instruction) {
            spec.instruction = getInstruction(table, spec);
        }
        const instruction = spec.instruction[0];
        const bindings = spec.instruction[1];
        trace.log({ table, instruction, bindings });
        try {
            countobj = await knex(table).count().whereRaw(instruction, bindings);
        }
        catch (err) {
            console.log(err);
        }
    }
    else {
        countobj = await knex(table).count();
    }
    const countkey = Object.keys(countobj[0])[0];
    const count = countobj[0][countkey];
    trace.log(count);
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
    let countobj = {};
    if (spec && spec.searches.length) {
        if (!spec.instruction) {
            spec.instruction = getInstruction(table, spec);
        }
        const instruction = spec.instruction[0];
        const bindings = spec.instruction[1];
        trace.log({ table, instruction, bindings });
        try {
            countobj = await knex(table).sum(col).whereRaw(instruction, bindings);
        }
        catch (err) {
            console.log(err);
        }
    }
    else {
        countobj = await knex(table).sum(col);
    }
    const countkey = Object.keys(countobj[0])[0];
    const count = countobj[0][countkey];
    trace.log(count);
    return (count);
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
    const rec = fixRecord(table, record, tableData, attributes);
    for (const key of Object.keys(attributes)) {
        if (attributes[key].process.createdAt) {
            rec[key] = Date.now();
        }
        if (attributes[key].process.updatedAt) {
            rec[key] = Date.now();
        }
    }
    trace.log('inserting:', rec);
    let inserted;
    let id = 0;
    try {
        trace.log(table, rec);
        let temp = await knex(table).insert(rec).into(table).returning('*');
        trace.log(temp, typeof (temp), Array.isArray(temp), typeof (temp[0]));
        if (Array.isArray(temp)) {
            if (typeof (temp[0]) === 'number') {
                id = temp[0];
            }
            else {
                if (temp[0][tableData.primaryKey]) {
                    id = temp[0][tableData.primaryKey];
                }
            }
        }
        if (suds.dbDriver == 'mysql') {
            inserted = await knex(table).select(knex.raw('LAST_INSERT_ID()')).limit(1);
            id = inserted[0]['LAST_INSERT_ID()'];
        }
        trace.log(id);
        if (id == 0) {
            console.log(`Table ${table}: Default code is used to get the inserted ID.
      This is not suitable for  multi-user environment.`);
            const last = await knex(table).orderBy(tableData.primaryKey, 'DESC').limit(1);
            trace.log(last);
            id = last[0][tableData.primaryKey];
        }
    }
    catch (err) {
        throw new Error(`Insert failed table: ${table} 
     Error: ${err}`);
    }
    trace.log(id);
    record[tableData.primaryKey] = id;
    return (record);
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
    if (spec && spec.searches.length) {
        if (!spec.instruction) {
            spec.instruction = getInstruction(table, spec);
        }
        const instruction = spec.instruction[0];
        const bindings = spec.instruction[1];
        try {
            await knex(table).whereRaw(instruction, bindings).del();
        }
        catch (err) {
            throw new Error(`Database error deleting Rows in table ${table}.
     Instruction: ${instruction}
     Bindings:  ${bindings}
     Error: ${err}`);
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
    let mainPage = suds.mainPage;
    const tableData = tableDataFunction(table);
    if (!mainPage) {
        mainPage = '/';
    }
    let message = 'Deleting record';
    const condition = {};
    try {
        condition[tableData.primaryKey] = id;
        await knex(table).where(condition).del();
    }
    catch (err) {
        throw new Error(`Database error deleting Row ${id} in table ${table}
    ${condition}
    Error: ${err}`);
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
async function updateRow(table, record) {
    trace.log({ inputs: arguments });
    const tableData = tableDataFunction(table);
    const attributes = mergeAttributes(table);
    const rec = fixRecord(table, record, tableData, attributes);
    const condition = {};
    condition[tableData.primaryKey] = rec[tableData.primaryKey];
    /* kludge to allow me to use the same schema for sql and nonsql test databases */
    if (suds.sqlKludge && tableData.primaryKey == '_id') {
        condition['id'] = rec['_id'];
    }
    trace.log({ op: 'update ', table, condition, record: rec });
    let startTime = new Date().getTime();
    trace.log({ where: 'Start of read', collection: table, level: 'timer' }); // timing
    try {
        await knex(table).where(condition).update(rec);
    }
    catch (err) {
        console.log(table, '\n', condition, '\n', rec, '\n', err);
        throw new Error(`Error updating ${table}
 `);
    }
    trace.log({ 'Elapsed time (ms)': new Date().getTime() - startTime, level: 'timer', });
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
    if (!limit && spec.limit) {
        limit = spec.limit;
    }
    let rows = {};
    const tableData = tableDataFunction(table);
    trace.log(table, tableData);
    if (!sortKey && spec.sort) {
        sortKey = spec.sort[0];
    }
    if (!sortKey) {
        sortKey = tableData.primaryKey;
    }
    trace.log(sortKey, tableData.primaryKey);
    if (!direction && spec.sort) {
        direction = spec.sort[1];
    }
    if (!direction) {
        direction = 'DESC';
    }
    try {
        if (spec && spec.searches && spec.searches.length) {
            if (!spec.instruction) {
                spec.instruction = getInstruction(table, spec);
            }
            const instruction = spec.instruction[0];
            const bindings = spec.instruction[1];
            trace.log({ table, instruction, bindings, limit, sortKey, direction });
            let startTime = new Date().getTime();
            trace.log({ where: 'Start of read', table: table, instruction: instruction, level: 'timer' }); // timing
            if (limit && limit != -1) {
                rows = await knex(table).whereRaw(instruction, bindings).orderBy(sortKey, direction).offset(offset).limit(limit);
            }
            else {
                rows = await knex(table).whereRaw(instruction, bindings).orderBy(sortKey, direction).offset(offset);
            }
            trace.log({ records: rows.length, 'Elapsed time (ms)': new Date().getTime() - startTime, level: 'timer', });
        }
        else {
            let startTime = new Date().getTime();
            trace.log({ where: 'Start of read', table: table, level: 'timer' }); // timing
            if (limit && limit != -1) {
                rows = await knex(table).orderBy(sortKey, direction).offset(offset).limit(limit);
            }
            else {
                trace.log({ table, offset, offset, order: sortKey, direction });
                rows = await knex(table).orderBy(sortKey, direction).offset(offset);
            }
            trace.log({ records: rows.length, 'Elapsed time (ms)': new Date().getTime() - startTime, level: 'timer', });
        }
        trace.log(rows);
        const attributes = mergeAttributes(table);
        trace.log(attributes, { level: 'verbose' });
        for (let i = 0; i < rows.length; i++) {
            let record = rows[i];
            for (const key of Object.keys(record)) {
                // standardise boolean value (on mysql = 0 or 1 type TINYINT)
                if (!attributes[key]) {
                    console.log(`Warning - no attributes for ${key} in table ${table}`);
                    continue;
                }
                if (attributes[key].type == 'boolean') {
                    trace.log(`fixing boolean: ${key} - ${record[key]}`);
                    if (record[key]) {
                        record[key] = true;
                    }
                    else {
                        record[key] = false;
                    }
                }
            }
        }
    }
    catch (err) {
        throw new Error(`Database error getting rowsin table ${table}
    Instruction: ${instruction}
    Error: ${err}`);
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
    trace.log({ inputs: arguments, td: typeof tableDataFunction });
    let record = {};
    const tableData = tableDataFunction(table);
    trace.log({ tableData, maxdepth: 3 });
    if (!col) {
        col = tableData.primaryKey;
    }
    ;
    trace.log(col, val);
    const spec = { searches: [[col, 'eq', val]] };
    trace.log(spec);
    const recordarray = await getRows(table, spec);
    trace.log({ table, value: val, recordarray });
    if (recordarray[0]) {
        record = recordarray[0];
        trace.log('Record: \n', record);
        return ((record));
    }
    else {
        const result = `No row ${col} = ${val} on table ${table}`;
        console.log(result);
        return ({ err: 1, errmsg: result });
    }
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
    let output = '';
    const knextype = {
        string: 'string',
        number: 'integer',
        boolean: 'boolean'
    };
    for (const table of suds.tables) {
        exists = await knex.schema.hasTable(table);
        console.log('exists:', exists);
        if (exists) {
            output += `Table ${table} exists - no action taken.<br />`;
        }
        else {
            output += `Creating table ${table}<br />`;
            let type = 'string';
            let length;
            const tableData = require('../table-data')(table, '#superuser#');
            const attributes = await mergeAttributes(table, '#superuser#'); // Merve field attributes in model with config.suds tables
            await knex.schema.createTable(table, function (t) {
                for (const key of Object.keys(attributes)) {
                    if (attributes[key].collection) {
                        continue;
                    }
                    if (knextype[attributes[key].type]) {
                        type = knextype[attributes[key].type];
                    }
                    if (attributes[key].database.type) {
                        type = attributes[key].database.type;
                    }
                    if (attributes[key].database.length) {
                        length = attributes[key].database.length, places = 0;
                    }
                    if (attributes[key].database.places) {
                        places = attributes[key].database.places;
                    }
                    if (attributes[key].autoincrement) {
                        type = 'increments';
                    }
                    ;
                    if (key == tableData.primaryKey) {
                        t[type](key).primary();
                    }
                    else {
                        if (length) {
                            t[type](key, length, places);
                        }
                        else {
                            t[type](key);
                        }
                    }
                }
            });
        }
    }
    output += `<a href="${suds.mainPage}">admin page</a>`;
    res.send(output);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3FsLWZ1bmN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9iaW4vc3Vkcy9kYmRyaXZlcnMvc3FsLWZ1bmN0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29EQXNCb0Q7QUFDcEQsTUFBTSx3QkFBd0IsR0FBRyxTQUFTLENBQUEsQ0FBQyxtQ0FBbUM7QUFFOUUsT0FBTyxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUE7QUFDakMsT0FBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7QUFDdkIsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7QUFDekIsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDN0IsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDN0IsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDN0IsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDN0IsT0FBTyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7QUFDL0IsT0FBTyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDN0IsT0FBTyxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUE7QUFHckMsMkJBQTJCO0FBRTNCLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUNwQyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtBQUM1QyxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUNsRCxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQTtBQUN0RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxFQUFFLENBQUE7QUFDbkQsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBRTFDLE1BQU0sYUFBYSxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUE7QUFDOUMsNEJBQTRCO0FBRTVCOzs7Ozs7a0RBTWtEO0FBQ2xELFNBQVMsYUFBYSxDQUFFLEVBQUU7SUFDeEIsSUFBSSxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssUUFBUSxFQUFFO1FBQUUsT0FBTyxFQUFFLENBQUE7S0FBRTtTQUFNO1FBQUUsT0FBTyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUE7S0FBRTtBQUMxRSxDQUFDO0FBRUQ7Ozs7Ozs7O2tEQVFrRDtBQUNsRCxTQUFTLFdBQVcsQ0FBRSxFQUFFO0lBQ3RCLE9BQU8sRUFBRSxDQUFBO0FBQ1gsQ0FBQztBQUVEOzs7OztHQUtHO0FBR0g7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdCRztBQUVILFNBQVMsY0FBYyxDQUFFLEtBQUssRUFBRSxJQUFJO0lBQ2xDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQTtJQUMvQixNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDLENBQUE7SUFDckQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQTtJQUMxQyx1Q0FBdUM7SUFDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7UUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtLQUFFO0lBQ3ZDLG9CQUFvQjtJQUNwQiwrR0FBK0c7SUFDL0csSUFBSTtJQUNKLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQTtJQUNqQixJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7UUFBRSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQTtLQUFFO0lBQy9DLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7SUFDdEMsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFBO0lBQ3BCLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQTtJQUNuQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDVCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN4QyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFBRSxXQUFXLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUE7U0FBRTtRQUMvQyxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEMsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzlCLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUMxQixJQUFJLE1BQU0sR0FBRyxXQUFXLENBQUE7UUFDeEIsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLGNBQWMsRUFBRTtZQUN0QyxNQUFNLEdBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxXQUFXLENBQUE7U0FDbkM7UUFDRCxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsWUFBWSxFQUFFO1lBQ3BDLE1BQU0sR0FBRyxJQUFJLE1BQU0sR0FBRyxDQUFBO1NBQ3ZCO1FBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFBO1FBRXpELCtFQUErRTtRQUMvRSwrRUFBK0U7UUFDL0UsK0VBQStFO1FBQy9FLCtFQUErRTtRQUMvRSwrRUFBK0U7UUFDL0UsK0VBQStFO1FBQy9FLCtFQUErRTtRQUMvRSxJQUFJLFdBQVcsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQUUsU0FBUTtTQUFFO1FBRXpFLElBQUksT0FBTyxJQUFJLFlBQVksSUFBSSxPQUFPLElBQUksWUFBWSxFQUFFO1lBQ3RELFdBQVcsSUFBSSxHQUFHLE1BQU0sU0FBUyxDQUFBO1lBQ2pDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsS0FBSyxHQUFHLENBQUE7WUFDM0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFBO1lBQ3ZELFNBQVE7U0FDVDtRQUNELElBQUksT0FBTyxJQUFJLFVBQVUsRUFBRTtZQUN6QixXQUFXLElBQUksR0FBRyxNQUFNLFNBQVMsQ0FBQTtZQUNqQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLEtBQUssR0FBRyxDQUFBO1lBQzVCLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQTtZQUN2RCxTQUFRO1NBQ1Q7UUFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3ZCLE1BQU0sVUFBVSxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUN6QyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUE7UUFDckIsSUFBSSxPQUFPLElBQUksTUFBTSxFQUFFO1lBQUUsV0FBVyxJQUFJLEdBQUcsTUFBTSxTQUFTLENBQUE7U0FBRTtRQUM1RCxJQUFJLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLElBQUksUUFBUSxFQUFFO1lBQUUsS0FBSyxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFBO1NBQUU7UUFDM0UsSUFBSSxPQUFPLElBQUksUUFBUSxJQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7WUFBRSxXQUFXLElBQUksR0FBRyxNQUFNLE1BQU0sQ0FBQTtTQUFFO1FBQzlFLElBQUksT0FBTyxJQUFJLE1BQU0sSUFBSSxPQUFPLElBQUksSUFBSSxFQUFFO1lBQUUsV0FBVyxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUE7U0FBRTtRQUM1RSxJQUFJLE9BQU8sSUFBSSxNQUFNLElBQUksT0FBTyxJQUFJLElBQUksRUFBRTtZQUFFLFdBQVcsSUFBSSxHQUFHLE1BQU0sTUFBTSxDQUFBO1NBQUU7UUFDNUUsSUFBSSxPQUFPLElBQUksSUFBSSxFQUFFO1lBQUUsV0FBVyxJQUFJLEdBQUcsTUFBTSxPQUFPLENBQUE7U0FBRTtRQUN4RCxJQUFJLE9BQU8sSUFBSSxJQUFJLEVBQUU7WUFBRSxXQUFXLElBQUksR0FBRyxNQUFNLE9BQU8sQ0FBQTtTQUFFO1FBQ3hELElBQUksT0FBTyxJQUFJLElBQUksRUFBRTtZQUFFLFdBQVcsSUFBSSxHQUFHLE1BQU0sT0FBTyxDQUFBO1NBQUU7UUFDeEQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQ3hEO0lBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFBO0lBQ3BDLE9BQU8sQ0FBQyxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFBO0FBQ2xDLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQUNILFNBQVMsU0FBUyxDQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFVBQVU7SUFDdEQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFBO0lBQ2hDLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQTtJQUNkLEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUNyQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQUUsU0FBUTtTQUFFLENBQUMsZ0NBQWdDO1FBQ25FLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRTtZQUFFLFNBQVE7U0FBRSxDQUFDLGFBQWE7UUFDMUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDbEgsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUN0QixJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksUUFBUSxFQUFFO1lBQ3BDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7WUFDOUIsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7Z0JBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTthQUFFO1NBQ3RDO1FBQ0QsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLFNBQVMsRUFBRTtZQUNyQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFBO2FBQUU7aUJBQU07Z0JBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQTthQUFFO1NBQzVEO0tBQ0Y7SUFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDZCxDQUFDO0FBRUQ7Ozs7Ozs7OztHQVNHO0FBQ0gsS0FBSyxVQUFVLFNBQVMsQ0FBRSxLQUFLLEVBQUUsSUFBSTtJQUNuQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7SUFDL0IsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFBO0lBQ2pCLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUMsQ0FBQTtJQUNyRCxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO1FBQ2pELElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3JCLElBQUksQ0FBQyxXQUFXLEdBQUcsY0FBYyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQTtTQUMvQztRQUNELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDdkMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFBO1FBQzNDLElBQUk7WUFDRixRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQTtTQUNyRTtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtTQUNqQjtLQUNGO1NBQU07UUFDTCxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUE7S0FDckM7SUFDRCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzVDLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUNuQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBRWhCLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtBQUNoQixDQUFDO0FBRUQ7Ozs7Ozs7Ozs7R0FVRztBQUNILEtBQUssVUFBVSxTQUFTLENBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHO0lBQ3hDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQTtJQUMvQixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUE7SUFDakIsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7UUFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDckIsSUFBSSxDQUFDLFdBQVcsR0FBRyxjQUFjLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFBO1NBQy9DO1FBQ0QsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN2QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUE7UUFDM0MsSUFBSTtZQUNGLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQTtTQUN0RTtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtTQUNqQjtLQUNGO1NBQU07UUFDTCxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0tBQ3RDO0lBQ0QsTUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUM1QyxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDbkMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUVoQixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDaEIsQ0FBQztBQUVEOzs7Ozs7Ozs7OztHQVdHO0FBRUgsS0FBSyxVQUFVLFNBQVMsQ0FBRSxLQUFLLEVBQUUsTUFBTTtJQUNyQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7SUFDaEMsTUFBTSxTQUFTLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDMUMsTUFBTSxVQUFVLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3pDLE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQTtJQUMzRCxLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7UUFDekMsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRTtZQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7U0FBRTtRQUNoRSxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFO1lBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtTQUFFO0tBQ2pFO0lBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUE7SUFDNUIsSUFBSSxRQUFRLENBQUE7SUFDWixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUE7SUFDVixJQUFJO1FBQ0YsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDckIsSUFBSSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbkUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDckUsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3ZCLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFBRTtnQkFDakMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTthQUNiO2lCQUFNO2dCQUNMLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRTtvQkFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtpQkFBRTthQUMxRTtTQUNGO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLE9BQU8sRUFBRTtZQUM1QixRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUMxRSxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUE7U0FDckM7UUFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2IsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEtBQUs7d0RBQ3dCLENBQUMsQ0FBQTtZQUNuRCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDN0UsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUNmLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFBO1NBQ25DO0tBQ0Y7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLEtBQUs7Y0FDbkMsR0FBRyxFQUFFLENBQUMsQ0FBQTtLQUNqQjtJQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDYixNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtJQUNqQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDakIsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsS0FBSyxVQUFVLFVBQVUsQ0FBRSxLQUFLLEVBQUUsSUFBSTtJQUNwQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7SUFDL0IsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ2hCLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO1FBQ2hDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3JCLElBQUksQ0FBQyxXQUFXLEdBQUcsY0FBYyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQTtTQUMvQztRQUNELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDdkMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUVwQyxJQUFJO1lBQ0YsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtTQUN4RDtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1osTUFBTSxJQUFJLEtBQUssQ0FBQyx5Q0FBeUMsS0FBSztvQkFDaEQsV0FBVztrQkFDYixRQUFRO2NBQ1osR0FBRyxFQUFFLENBQUMsQ0FBQTtTQUNmO1FBQ0QsTUFBTSxHQUFHOzs7O21FQUlzRCxJQUFJLENBQUMsUUFBUSxVQUFVLEtBQUssZ0JBQWdCLElBQUksQ0FBQyxTQUFTO3VFQUN0RCxJQUFJLENBQUMsUUFBUSxNQUFNLElBQUksQ0FBQyxZQUFZOztHQUV4RyxDQUFBO0tBQ0E7U0FBTTtRQUNMLE1BQU0sR0FBRzs7Ozs7bUVBS3NELElBQUksQ0FBQyxRQUFRLFVBQVUsS0FBSyxnQkFBZ0IsSUFBSSxDQUFDLFNBQVM7dUVBQ3RELElBQUksQ0FBQyxRQUFRLE1BQU0sSUFBSSxDQUFDLFlBQVk7O0dBRXhHLENBQUE7S0FDQTtJQUNELE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNqQixDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsS0FBSyxVQUFVLFNBQVMsQ0FBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLEVBQUU7SUFDN0MsS0FBSyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTtJQUNoQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQTtJQUNyRixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFBO0lBQzVCLE1BQU0sU0FBUyxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzFDLElBQUksQ0FBQyxRQUFRLEVBQUU7UUFBRSxRQUFRLEdBQUcsR0FBRyxDQUFBO0tBQUU7SUFDakMsSUFBSSxPQUFPLEdBQUcsaUJBQWlCLENBQUE7SUFDL0IsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFBO0lBRXBCLElBQUk7UUFDRixTQUFTLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNwQyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUE7S0FDekM7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsK0JBQStCLEVBQUUsYUFBYSxLQUFLO01BQ2pFLFNBQVM7YUFDRixHQUFHLEVBQUUsQ0FBQyxDQUFBO0tBQ2hCO0lBQ0QsTUFBTSxHQUFHO1lBQ0MsT0FBTzs7O21FQUdnRCxRQUFRLFVBQVUsS0FBSyxnQkFBZ0IsSUFBSSxDQUFDLFNBQVM7dUVBQ2pELFFBQVEsTUFBTSxJQUFJLENBQUMsWUFBWTs7R0FFbkcsQ0FBQTtJQUNELE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNqQixDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILEtBQUssVUFBVSxTQUFTLENBQUUsS0FBSyxFQUFFLE1BQU07SUFDckMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFBO0lBQ2hDLE1BQU0sU0FBUyxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzFDLE1BQU0sVUFBVSxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUN6QyxNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLENBQUE7SUFDM0QsTUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFBO0lBQ3BCLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUUzRCxpRkFBaUY7SUFDakYsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQyxVQUFVLElBQUksS0FBSyxFQUFFO1FBQ25ELFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUE7S0FDN0I7SUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFBO0lBQzNELElBQUksU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDcEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQSxDQUFDLFNBQVM7SUFDbEYsSUFBSTtRQUNGLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7S0FDL0M7SUFDRCxPQUFPLEdBQUcsRUFBRTtRQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFDekQsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsS0FBSztFQUN6QyxDQUFDLENBQUM7S0FDRDtJQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxtQkFBbUIsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLFNBQVMsRUFBRSxLQUFLLEVBQUUsT0FBTyxHQUFHLENBQUMsQ0FBQTtBQUN2RixDQUFDO0FBRUQ7Ozs7Ozs7OztHQVNHO0FBQ0gsS0FBSyxVQUFVLE9BQU8sQ0FBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFNBQVM7SUFDcEUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFBO0lBQy9CLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtRQUFFLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFBO0tBQUU7SUFDaEQsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFBO0lBQ2IsTUFBTSxTQUFTLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDMUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUE7SUFDM0IsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQUUsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBRTtJQUNyRCxJQUFJLENBQUMsT0FBTyxFQUFFO1FBQUUsT0FBTyxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUE7S0FBRTtJQUNoRCxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUE7SUFDeEMsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQUUsU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBRTtJQUN6RCxJQUFJLENBQUMsU0FBUyxFQUFFO1FBQUUsU0FBUyxHQUFHLE1BQU0sQ0FBQTtLQUFFO0lBQ3RDLElBQUk7UUFDRixJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO1lBQ2pELElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNyQixJQUFJLENBQUMsV0FBVyxHQUFHLGNBQWMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUE7YUFDL0M7WUFDRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3ZDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDcEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQTtZQUN0RSxJQUFJLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFBO1lBQ3BDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQSxDQUFDLFNBQVM7WUFDdkcsSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxFQUFFO2dCQUN4QixJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7YUFDakg7aUJBQU07Z0JBQ0wsSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUE7YUFDcEc7WUFDRCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sR0FBRyxDQUFDLENBQUE7U0FDNUc7YUFBTTtZQUNMLElBQUksU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUE7WUFDcEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQSxDQUFDLFNBQVM7WUFDN0UsSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxFQUFFO2dCQUN4QixJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFBO2FBQ2pGO2lCQUFNO2dCQUNMLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7Z0JBQy9ELElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTthQUNwRTtZQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxtQkFBbUIsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLFNBQVMsRUFBRSxLQUFLLEVBQUUsT0FBTyxHQUFHLENBQUMsQ0FBQTtTQUM1RztRQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDZixNQUFNLFVBQVUsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDekMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQTtRQUMzQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNwQyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDcEIsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNyQyw2REFBNkQ7Z0JBQzdELElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsK0JBQStCLEdBQUcsYUFBYSxLQUFLLEVBQUUsQ0FBQyxDQUFBO29CQUNuRSxTQUFRO2lCQUNUO2dCQUNELElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxTQUFTLEVBQUU7b0JBQ3JDLEtBQUssQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEdBQUcsTUFBTSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFBO29CQUNwRCxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRTt3QkFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFBO3FCQUFFO3lCQUFNO3dCQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUE7cUJBQUU7aUJBQ3JFO2FBQ0Y7U0FDRjtLQUNGO0lBQ0QsT0FBTyxHQUFHLEVBQUU7UUFDVixNQUFNLElBQUksS0FBSyxDQUFDLHVDQUF1QyxLQUFLO21CQUM3QyxXQUFXO2FBQ2pCLEdBQUcsRUFBRSxDQUFDLENBQUE7S0FDaEI7SUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDZixDQUFDO0FBRUQ7Ozs7OztHQU1HO0FBQ0gsS0FBSyxVQUFVLE1BQU0sQ0FBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEdBQUc7SUFDcEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLE9BQU8saUJBQWlCLEVBQUUsQ0FBQyxDQUFBO0lBQzlELElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQTtJQUVmLE1BQU0sU0FBUyxHQUFHLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUE7SUFDckMsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUFFLEdBQUcsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFBO0tBQUU7SUFBQSxDQUFDO0lBQ3pDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ25CLE1BQU0sSUFBSSxHQUFHLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtJQUM3QyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ2YsTUFBTSxXQUFXLEdBQUcsTUFBTSxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQzlDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFBO0lBQzdDLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ2xCLE1BQU0sR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDdkIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDL0IsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtLQUNsQjtTQUFNO1FBQ0wsTUFBTSxNQUFNLEdBQUcsVUFBVSxHQUFHLE1BQU0sR0FBRyxhQUFhLEtBQUssRUFBRSxDQUFBO1FBQ3pELE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDbkIsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQTtLQUNwQztBQUNILENBQUM7QUFFRDs7Ozs7Ozs7R0FRRztBQUNILEtBQUssVUFBVSxXQUFXLENBQUUsR0FBRyxFQUFFLEdBQUc7SUFDbEMsbUNBQW1DO0lBQ25DLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQTtJQUNmLE1BQU0sUUFBUSxHQUFHO1FBQ2YsTUFBTSxFQUFFLFFBQVE7UUFDaEIsTUFBTSxFQUFFLFNBQVM7UUFDakIsT0FBTyxFQUFFLFNBQVM7S0FDbkIsQ0FBQTtJQUVELEtBQUssTUFBTSxLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUMvQixNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUM5QixJQUFJLE1BQU0sRUFBRTtZQUNWLE1BQU0sSUFBSSxTQUFTLEtBQUssa0NBQWtDLENBQUE7U0FDM0Q7YUFBTTtZQUNMLE1BQU0sSUFBSSxrQkFBa0IsS0FBSyxRQUFRLENBQUE7WUFFekMsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFBO1lBQ25CLElBQUksTUFBTSxDQUFBO1lBQ1YsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLEtBQUssRUFBRSxhQUFhLENBQUMsQ0FBQTtZQUVoRSxNQUFNLFVBQVUsR0FBRyxNQUFNLGVBQWUsQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUEsQ0FBQywwREFBMEQ7WUFFekgsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDO2dCQUM5QyxLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7b0JBQ3pDLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRTt3QkFBRSxTQUFRO3FCQUFFO29CQUM1QyxJQUFJLFFBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUU7d0JBQUUsSUFBSSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUE7cUJBQUU7b0JBQzdFLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUU7d0JBQUUsSUFBSSxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFBO3FCQUFFO29CQUMzRSxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO3dCQUFFLE1BQU0sR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFBO3FCQUFFO29CQUM3RixJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO3dCQUFFLE1BQU0sR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQTtxQkFBRTtvQkFDakYsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsYUFBYSxFQUFFO3dCQUFFLElBQUksR0FBRyxZQUFZLENBQUE7cUJBQUU7b0JBQUEsQ0FBQztvQkFFM0QsSUFBSSxHQUFHLElBQUksU0FBUyxDQUFDLFVBQVUsRUFBRTt3QkFDL0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO3FCQUN2Qjt5QkFBTTt3QkFDTCxJQUFJLE1BQU0sRUFBRTs0QkFDVixDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQTt5QkFDN0I7NkJBQU07NEJBQ0wsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFBO3lCQUNiO3FCQUNGO2lCQUNGO1lBQ0gsQ0FBQyxDQUFDLENBQUE7U0FDSDtLQUNGO0lBRUQsTUFBTSxJQUFJLFlBQVksSUFBSSxDQUFDLFFBQVEsa0JBQWtCLENBQUE7SUFDckQsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUNsQixDQUFDIn0=