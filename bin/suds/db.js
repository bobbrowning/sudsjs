
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
let Generic_Database__Driver='generic';    // To make documentation.js work...

exports.connect=connect;
exports.createTable = createTable;
exports.getRow = getRow;
exports.getRows = getRows;
exports.countRows = countRows;
exports.totalRows = totalRows;
exports.createRow = createRow;
exports.deleteRow = deleteRow;
exports.deleteRows = deleteRows;
exports.updateRow=updateRow;
exports.standardiseId = standardiseId;

let trace = require('track-n-trace');
let suds = require('../../config/suds');
const tableDataFunction = require('./table-data');
let mergeAttributes = require('./merge-attributes');
let lang = require('../../config/language')['EN'];

/** *********************************************
 * 
 * Connect to database 
 * 
 * No parameters. The database specification is in 
 * /config/suds.js.  Connects to the database and sets up 
 * a global 'knex'
 * 
 * ********************************************* */

function connect() {
  trace.log({connect:suds.database.client,event: 'verbose'})
  let knex=require('knex');
  globalThis.knex = knex
  
  
  (suds.database);
  console.log('connected to database');

}

/** *********************************************
 * 
 * Given a representation of the record key, returns
 * the standard format. (in this case integer)
 * @param {undefined} Record key
 * 
 * ******************************************** */
 function standardiseId(id) {
  if (typeof (id) == 'number') {return id}
  else {return parseInt(id);}
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
function stringifyId (id) {
 return id;
}


/**
 * 
 * Quick attributes object without any processing
 * @param {string} table 
 * @returns 
 */
 function rawAttributes(table) {
  let tableData = require('../../tables/' + table);
  standardHeader = {};
  if (tableData.standardHeader) {
    standardHeader = require('../../config/standard-header');
  }
  let combined= { ...standardHeader, ...tableData.attributes };
  return(combined);
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
  let tableData = require('../../tables/' + table);
  trace.log({ tableData: tableData, level: 'verbose' });
  /* Rationalise the searchspec object */
  if (!spec.andor) { spec.andor = 'and'; }
  // if (!spec.sort) {
  //   spec.sort = [Object.keys(tableData.attributes)[0], 'DESC'];  // sort defaults to first field (normally ID) 
  // }
  let searches = [];
  if (spec.searches) { searches = spec.searches; }
  trace.log({ searches: spec.searches });
  let instruction = '';
  let bindings = [];
  let b = 0;
  for (i = 0; i < searches.length; i++) {
    if (i > 0) { instruction += ` ${spec.andor} ` }
    let searchField = searches[i][0];
    let compare = searches[i][1];
    let value = searches[i][2];
    let qfield = searchField;
    if (suds.qualifyColName) {
      qfield = table + '.' + searchField;
    }
    if (suds.quoteColName) {
      qfield = `"${qfield}"`;
    }

    trace.log({ table: table, searchField: searchField, qfield: qfield, compare: compare, value: value })


    /* OK this is a kludge.  But sometimes you want to allow people to search by */
    /*  a string field and/or a numeric field. This doesn't work because         */
    /*  you end up testing a numeric field against a string.  99% of the time    */
    /*  people are trying to find a product or person or something either by     */
    /*  name or ID.  ('enter product name or number') - that is my excuse anyway */
    if (searchField == tableData.primaryKey && !Number.isInteger(Number(value))) { continue }


    if (compare == 'startsWith' || compare == 'startswith') {
      instruction += `${qfield} like ?`
      bindings[b++] = `${value}%`
      continue;
    }
    if (compare == 'contains') {
      instruction += `${qfield} like ?`
      bindings[b++] = `%${value}%`
      continue;
    }
    let attributes=rawAttributes(table);
    bindings[b++] = value;
    if (compare == 'like') { instruction += `${qfield} like ?` }
    if (attributes[searchField].type == 'string') { value = '"' + value + '"' }
    if (compare == 'equals' || compare == 'eq') { instruction += `${qfield} = ?` }
    if (compare == 'less' || compare == 'lt') { instruction += `${qfield} < ?` }
    if (compare == 'more' || compare == 'gt') { instruction += `${qfield} > ?` }
    if (compare == 'le') { instruction += `${qfield} <= ?` }
    if (compare == 'ge') { instruction += `${qfield} >= ?` }
    if (compare == 'ne') { instruction += `${qfield} <> ?` }


  }

  trace.log({ instruction: instruction, bindings: bindings });
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
  trace.log({ inputs: arguments })
  let rec = {};
  for (let key of Object.keys(record)) {
    if (!attributes[key]) { continue }   // skip field if not in database
    if (attributes[key].collection) { continue }  //  ""     ""
    trace.log({ key: key, type: attributes[key].type, val: record[key], num: Number(record[key]), isNan: isNaN(rec[key]) })
    rec[key] = record[key];
    if (attributes[key].type == 'number') {
      rec[key] = Number(record[key]);
      if (isNaN(rec[key])) { rec[key] = 0; }
    }
    if (attributes[key].type == 'boolean') {
      if (rec[key]) { rec[key] = true } else { rec[key] = false }
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
  let tableData = require('../../tables/' + table);
  if (spec && spec.searches && spec.searches.length) {
    if (!spec.instruction) {
      spec.instruction = getInstruction(table, spec);
    }
    let instruction = spec.instruction[0];
    let bindings = spec.instruction[1];
    trace.log({ table: table, instruction: instruction, bindings: bindings });
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
  let countkey = Object.keys(countobj[0])[0]
  let count = countobj[0][countkey];
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
    let instruction = spec.instruction[0];
    let bindings = spec.instruction[1];
    trace.log({ table: table, instruction: instruction, bindings: bindings });
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
  let countkey = Object.keys(countobj[0])[0]
  let count = countobj[0][countkey];
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
  trace.log({ inputs: arguments })
  let tableData = tableDataFunction(table);
  let attributes = mergeAttributes(table);
  let rec = fixRecord(table, record, tableData, attributes);
  for (let key of Object.keys(attributes)) {
    if (attributes[key].process.createdAt) { rec[key] = Date.now() }
    if (attributes[key].process.updatedAt) { rec[key] = Date.now() }
  }
  trace.log('inserting:', rec);
  let inserted;
  let id = 0;
  try {
    trace.log(table, rec);
    temp = await knex(table).insert(rec).into(table).returning('*');
    trace.log(temp, typeof (temp), Array.isArray(temp), typeof (temp[0]));
    if (Array.isArray(temp)) {
      if (typeof (temp[0]) == 'number') {
        id = temp[0]
      }
      else {
        if (temp[0][tableData.primaryKey]) { id = temp[0][tableData.primaryKey] }
      }
    }
    if (suds.database.client == 'mysql') {
      inserted = await knex(table).select(knex.raw(`LAST_INSERT_ID()`)).limit(1);
      id = inserted[0]['LAST_INSERT_ID()'];
    }
    trace.log(id);
    if (id == 0) {
      console.log(`Table ${table}: Default code is used to get the inserted ID.
      This is not suitable for  multi-user environment.`)
      let last = await knex(table).orderBy(tableData.primaryKey, 'DESC').limit(1);
      trace.log(last);
      id = last[0][tableData.primaryKey];
    }
  }
  catch (err) {
    console.log(`Insert failed table: ${table}  Error: ${err}`);
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
  if (spec && spec.searches.length) {
    if (!spec.instruction) {
      spec.instruction = getInstruction(table, spec);
    }
    let instruction = spec.instruction[0];
    let bindings = spec.instruction[1];


    try {
      await knex(table).whereRaw(instruction, bindings).del();

    } catch (err) {
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
  let mainPage = suds.mainPage;
  let tableData = tableDataFunction(table);
  if (!mainPage) { mainPage = '/'; }
  let message = 'Deleting record';

  try {
    let condition = {};
    condition[tableData.primaryKey] = id;
    await knex(table).where(condition).del();

  } catch (err) {
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
async function updateRow(table, record) {
  trace.log({ inputs: arguments })
  let tableData = tableDataFunction(table);
  let attributes = mergeAttributes(table);
  let rec = fixRecord(table, record, tableData, attributes);
  let condition = {};
  condition[tableData.primaryKey] = rec[tableData.primaryKey];
  trace.log({ op: 'update ', table: table, condition: condition, record: rec });
  await knex(table).where(condition).update(rec);

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
async function getRows(table, spec, offset, limit, sortKey, direction,) {

  trace.log({ input: arguments });
  if (!limit && spec.limit) { limit = spec.limit }
  let rows = {};
  let tableData = tableDataFunction(table);
  trace.log(table, tableData);
  if (!sortKey && spec.sort) { sortKey = spec.sort[0]; }
  if (!sortKey) { sortKey = tableData.primaryKey; }
  trace.log(sortKey, tableData.primaryKey);
  if (!direction && spec.sort) { direction = spec.sort[1]; }
  if (!direction) { direction = 'DESC'; }
  if (spec && spec.searches && spec.searches.length) {
    if (!spec.instruction) {
      spec.instruction = getInstruction(table, spec);
    }
    let instruction = spec.instruction[0];
    let bindings = spec.instruction[1];
    trace.log({ instruction: instruction, bindings: bindings, limit: limit, sortKey: sortKey, direction: direction });
    if (limit && limit != -1) {
      rows = await knex(table).whereRaw(instruction, bindings).orderBy(sortKey, direction).offset(offset).limit(limit);
    }
    else {
      rows = await knex(table).whereRaw(instruction, bindings).orderBy(sortKey, direction).offset(offset);
    }
  }
  else {
    if (limit && limit != -1) {
      rows = await knex(table).orderBy(sortKey, direction).offset(offset).limit(limit);
    }
    else {
      trace.log({ table: table, offset: offset, offset, order: sortKey, direction: direction })
      rows = await knex(table).orderBy(sortKey, direction).offset(offset);
    }
  }

  trace.log(rows);
  let attributes = rawAttributes(table);
  trace.log(attributes, { level: 'verbose' });
  for (let i = 0; i < rows.length; i++) {
    record = rows[i];
    for (let key of Object.keys(record)) {
      // standardise boolean value (on mysql = 0 or 1 type TINYINT)
      if (attributes[key].type == 'boolean') {
        trace.log(`fixing boolean: ${key} - ${record[key]}`)
        if (record[key]) { record[key] = true } else { record[key] = false }
      }
    }
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
  trace.log({ inputs: arguments, td: typeof tableDataFunction })
  let record = {};

  let tableData = tableDataFunction(table);
  trace.log({ tableData: tableData, maxdepth: 3 })
  if (!col) { col = tableData.primaryKey };
  trace.log(col, val);
  let spec = { searches: [[col, 'eq', val]] };
  trace.log(spec);
  var recordarray = await getRows(table, spec);
  trace.log({ table: table, value: val, recordarray: recordarray });
  if (recordarray[0]) {
    record = recordarray[0];
    trace.log('Record: \n', record);
    return ((record));
  }
  else {
    let result = `No row ${col} = ${val} on table ${table}`;
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
  let knextype = {
    string: 'string',
    number: 'integer',
    boolean: 'boolean',
  };

  for (let table of suds.tables) {
    exists = await knex.schema.hasTable(table);
    console.log('exists:', exists)
    if (exists) {
      output += `Table ${table} exists - no action taken.<br />`;

    }
    else {
      output += `Creating table ${table}<br />`;

      let type = 'string';
      let length;
      let tableData = require('./table-data')(table, '#superuser#');

      let attributes = await mergeAttributes(table, '#superuser#');  // Merve field attributes in model with config.suds tables

      await knex.schema.createTable(table, function (t) {
        for (let key of Object.keys(attributes)) {
          if (attributes[key].collection) { continue }
          if (knextype[attributes[key].type]) { type = knextype[attributes[key].type] }
          if (attributes[key].database.type) { type = attributes[key].database.type }
          if (attributes[key].database.length) { length = attributes[key].database.length, places = 0; }
          if (attributes[key].database.places) { places = attributes[key].database.places; }
          if (attributes[key].autoincrement) { type = 'increments' };

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