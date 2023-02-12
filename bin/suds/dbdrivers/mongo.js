
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
let Database__Driver = 'mongodb';    // To make documentation.js work...

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


let trace = require('track-n-trace');
let suds = require('../../../config/suds');
const tableDataFunction = require('../table-data');
let mergeAttributes = require('../merge-attributes');
let lang = require('../../../config/language')['EN'];
const MongoClient = require("mongodb").MongoClient;
let ObjectId = require('mongodb').ObjectId;

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
  let auth = require('../../../local/auth');
  let authString = '';
  if (auth.mongo) { authString = `${auth.mongo.user}:${auth.mongo.password}@`; }
  let url = `mongodb://${authString}${suds.mongo.connection.host}`;
  let first = true;
  trace.log(Object.keys(suds.mongo.connection))
  for (let option of Object.keys(suds.mongo.connection)) {
    if (option == 'host') continue;
    if (option == 'database') continue;
    if (first) { url += '/?' } else { url += '&' }
    url += `${option}=${suds.mongo.connection[option]}`
    first = false;
  }
  trace.log(url);
  globalThis.client = new MongoClient(url);
  globalThis.database = client.db(suds.mongo.connection.database);
  suds.dbType = 'nosql';
  try {
    await client.connect();
    // Establish and verify connection
    console.log("Connected to MongoDB database server");
   await client.db("admin").command({ ping: 1 });
    console.log("MongoDB database alive and well");

  }
  catch (err) {
    console.log("Database connected failed", err);
    process.exit(Number(trace.line()))
  }
}

/**
 * 
 * Quick attributes object without any processing
 * @param {string} table 
 * @returns 
 */
function rawAttributes(table) {
  let tableData = require('../../../tables/' + table);
  standardHeader = {};
  if (tableData.standardHeader) {
    standardHeader = require('../../../config/standard-header')[suds[suds.dbDriver].standardHeader];
  }
  let combined = { ...standardHeader, ...tableData.attributes };
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
  return  objectifyId(id);
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
  if (suds[suds.dbDriver].dbDriverKey == 'objectId') {
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
  if (suds.mongo.dbDriverKey == 'objectId') {
    try {
      value = ObjectId(id)
    } catch (err) {
      value = '000000000000';                      // valid but won't return anything
      trace.error(err)
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


  let attributes = rawAttributes(table);
  /* Rationalise the searchspec object */
  if (!spec.andor) { spec.andor = 'and'; }
  // if (!spec.sort) {
  //   spec.sort = [Object.keys(tableData.attributes)[0], 'DESC'];  // sort defaults to first field (normally ID) 
  // }
  let searches = [];
  if (spec.searches) { searches = spec.searches; }
  trace.log({ searches: spec.searches });

  let query = {};
  if (spec.andor == 'or') { query = { $or: [] } }


  let b = 0;
  for (let i = 0; i < searches.length; i++) {
    let item = {};
    let searchField = searches[i][0];
    let compare = searches[i][1];
    let value = searches[i][2];
    let ta;
    let qfield = searchField;
    let path = [searchField];
    if (searchField.includes('.')) {
      trace.log(`*********************** ${searchField} *****************`);
      path = searchField.split('.');
      let step = attributes[path[0]];
      for (let j = 1; j < path.length; j++) {
        step = step.object[path[j]];
        trace.log({ step: step });
      }
      ta = step;
      trace.log(ta);
    }
    else {
      ta = attributes[searchField];
    }
    if (ta.model || searchField == '_id') {
      value = objectifyId(value)
    }
    trace.log({ searchField: searchField, path: path, qfield: qfield, compare: compare, value: value })

    insensitive = '';
    if (suds.caseInsensitive) { insensitive = 'i'; }
    if (compare == 'startsWith' || compare == 'startswith') {
      let re = new RegExp(`${value}.*`, insensitive);
      item = { $regex: re }
      //      continue; 
    }
    if (compare == 'contains' || compare == 'like') {
      let re = new RegExp(`.*${value}.*`, insensitive);
      item = { $regex: re }
      //     continue;
    }
    if (compare == 'equals' || compare == 'eq') {
      if (typeof value == 'string' && suds.caseInsensitive) {
        /* Make it case insensitive */
        let re = new RegExp(`^${value}$`, 'i')
        item = { '$regex': re }
      }
      else { item = value }
    }
    if (compare == 'less' || compare == 'lt') { item = { $lt: value } }
    if (compare == 'more' || compare == 'gt') { item = { $gt: value } }
    if (compare == 'le') { item = { $lte: value } }
    if (compare == 'ge') { item = { $gte: value } }
    if (compare == 'ne') { item = { $ne: value } }




    if (spec.andor == 'and') {
      query[qfield] = item;
    }
    else {
      let cond = {};
      cond[qfield] = item;
      query.$or.push(cond);
    }

  }

  trace.log({ table: table, instruction: query });
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
  trace.log({ table: table, record: record, mode: mode, break: '+', })
  trace.log({ attributes: attributes, level: 'verbose' });
  let rec = {};
  if (record._id && typeof (record._id) == 'string' && mode != 'new') {
    rec['_id'] = objectifyId(record._id);
    trace.log({ id: rec._id });
  }
  for (let key of Object.keys(attributes)) {
    trace.log(key);
    if (attributes[key].collection) { continue }  // Not a real field
    if (key == '_id') { continue; }       // Done already
    trace.log(key, Array.isArray(record[key]), record[key]);
    if (attributes[key].array
      && attributes[key].array.type != 'single'
      && !Array.isArray(record[key])) {
      record[key] = [record[key]];
    }
    trace.log({
      key: key,
      type: attributes[key].type,
      array: attributes[key].array,
      collection: attributes[key].collection,
      val: record[key],
      num: Number(record[key]),
      isNan: isNaN(rec[key]),
      level: 'verbose'
    })

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
            trace.log({ key: key, i: i, subrecord: record[key][i] })
            rec[key][i] = fixWrite(table, record[key][i], attributes[key].object, mode)
          }
          else {
            rec[key][i] = record[key][i]
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
      trace.log(attributes[key].type)
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
            if (isNaN(rec[key])) { rec[key] = 0; }
          }
          if (attributes[key].model) {
            if (rec[key] && rec[key] != '0' && typeof (rec[key]) == 'string') { rec[key] = objectifyId(rec[key]) }
          }
          if (attributes[key].type == 'boolean') {
            if (rec[key]) { rec[key] = true } else { rec[key] = false }
          }
        }
      }
    }
    trace.log({ key: key, old: record[key], new: rec[key] })
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
  if (record._id) { record._id = record._id.toString(); }
  for (let key of Object.keys(record)) {
    trace.log({ key: key, data: record[key], level: 'verbose' })
    if (!attributes[key]) { continue };                          // do nothing if item not in schema
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
          trace.log({ key: key, i: i, subrecord: record[key][i] })
          fixRead(record[key][i], attributes[key].object)
        }
        if (attributes[key].model && record[key][i]) {
          record[key][i] = record[key][i].toString();
        }
      }
    }
    else {
      trace.log(attributes[key].type, record[key]);
      if (attributes[key].type == 'object' && record[key]) {
        fixRead(record[key], attributes[key].object)
      }
      else {
        trace.log({ model: attributes[key].model, data: record[key] });
        if (attributes[key].model && record[key]) {
          record[key] = record[key].toString();
          trace.log({ key: key, data: record[key], level: 'verbose' })
        }
      }
    }
    trace.log({ key: key, data: record[key], level: 'verbose' })
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
  trace.log({ table: table, instruction: query, });
  try {
    count = await collection.countDocuments(query);
  }
  catch (err) {
    console.log(err);
  }
  trace.log({ count: count });
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
        $match: query,
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
  trace.log({ total: total });
  if (!total.length) return (0);
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
  trace.log({ inputs: arguments })
  let tableData = tableDataFunction(table);
  let attributes = mergeAttributes(table);
  let rec = fixWrite(table, record, attributes, 'new');
  for (let key of Object.keys(attributes)) {
    if (attributes[key].process.createdAt) { rec[key] = Date.now() }
    if (attributes[key].process.updatedAt) { rec[key] = Date.now() }
  }
  trace.log('inserting:', table, rec);
  const collection = database.collection(table);
  let result = await collection.insertOne(rec);
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
    let instruction = spec.instruction;
    trace.log(instruction);

    try {
      collection.deleteMany(instruction);

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
  const collection = database.collection(table);
  let mainPage = suds.mainPage;
  let tableData = tableDataFunction(table);
  if (typeof (id) == 'string') {
    id = objectifyId(id);
    trace.log({ id: id });
  }
  if (!mainPage) { mainPage = '/'; }
  let message = 'Deleting record';

  try {
    await collection.deleteOne({ _id: id });

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
async function updateRow(table, record, subschemas, additionalAttributes) {
  trace.log({ inputs: arguments })
  const collection = database.collection(table);
  let attributes = mergeAttributes(table, '', subschemas, additionalAttributes);
  let rec = fixWrite(table, record, attributes, 'update');
  let filter = { _id: rec._id };
  try {
    await collection.updateOne(filter, { $set: rec })
  }
  catch (err) {
    console.log(`Problem updating ${rec._id}`, err);
  }
  trace.log({ op: 'update ', table: table, filter: filter, record: rec });

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
  const collection = database.collection(table);
  if (!limit && spec.limit) { limit = spec.limit }
  let rows = {};
  let options = {};
  let instruction = {};
  let tableData = tableDataFunction(table);
  if (!sortKey && spec.sort) { sortKey = spec.sort[0]; }
  if (!sortKey) { sortKey = tableData.primaryKey; }
  if (!direction && spec.sort) { direction = spec.sort[1]; }
  if (!direction) { direction = 'DESC'; }
  if (spec && spec.searches && spec.searches.length) {
    if (!spec.instruction) {
      spec.instruction = getInstruction(table, spec);
    }
    instruction = spec.instruction;
  }
  trace.log({ instruction: instruction, limit: limit, offset: offset });
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

  trace.log(instruction, options);
  try {
    rows = await collection.find(instruction, options).toArray();
    trace.log({ instruction: instruction, options: options, rows: rows });
  }
  catch (err) {
    console.err(`Error reading ${table} returning empty set.  
    ${err}`);
    rows = [];
  }
  //    rows = await knex(table).whereRaw(instruction, bindings).orderBy(sortKey, direction).offset(offset).limit(limit);
  let attributes = rawAttributes(table);
  trace.log(attributes, { level: 'silly' });
  for (let i = 0; i < rows.length; i++) {
    fixRead(rows[i], attributes);  //rows[i] is an object so only address is passed
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
  trace.log({ inputs: arguments })
  let records = [];
  let record;
  let tableData = tableDataFunction(table);
  let spec;
  if (typeof val == 'object' && suds[suds.dbDriver].dbDriverKey == 'objectId') {
    val = val.toString();
  }
  if (typeof val == 'object') {
    records = await getRows(table, val);
  }
  else {
    if (!col) { col = tableData.primaryKey };
    if (col == '_id' && typeof val == 'string' && val.length == 24) { val = objectifyId(val) }
    trace.log(col, val);
    let instruction = {};
    instruction[col] = val;
    const collection = database.collection(table);
    trace.log(table, instruction, await collection.countDocuments());

    records = await collection.find(instruction).toArray();

  }
  trace.log({ collection: table, field: col, value: val, records: records });
  if (!records.length) { record = { err: 1, msg: 'Record not found' } }
  else { record = records[0] }
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