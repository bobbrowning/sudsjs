
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
let Generic_Database__Driver = 'mongodb';    // To make documentation.js work...

exports.connect = connect;
exports.createTable = createTable;

exports.getRow = getRow;
exports.getRows = getRows;
exports.getView = getView;
exports.countRows = countRows;
exports.totalRows = totalRows;
exports.createRow = createRow;
exports.deleteRow = deleteRow;
exports.deleteRows = deleteRows;
exports.updateRow = updateRow;
exports.standardiseId = standardiseId;


let trace = require('../../node_modules/track-n-trace');
let suds = require('../../config/suds');
const tableDataFunction = require('./table-data');
let mergeAttributes = require('./merge-attributes');
let lang = require('../../config/language')['EN'];
const MongoClient = require("mongodb").MongoClient;
let ObjectId = require('mongodb').ObjectId;
const Nano = require('nano');
let nano;

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

  let auth = require('../../local/auth');
  suds.dbType = 'nosql';
  try {
    const opts = {
      url: `http://${auth.user}:${auth.password}@localhost:5984`,
      requestDefaults: suds.database.requestDefaults,
    }
    nano = Nano(opts);

    globalThis.db = nano.db.use(suds.database.database);
    console.log(`Connected successfully to ${suds.database.database} on Couchdb database server`);

  }
  catch (err) {
    console.log("Database connected failed", err);
  }
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
  let combined = { ...standardHeader, ...tableData.attributes };
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
    try { value = ObjectId(id) } catch (err) {
      value = '000000000000';                      // valid but won't return anything
      trace.error(err)
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


  let attributes = rawAttributes(table);
  /* Rationalise the searchspec object */
  if (!spec.andor) { spec.andor = 'and'; }
  // if (!spec.sort) {
  //   spec.sort = [Object.keys(tableData.attributes)[0], 'DESC'];  // sort defaults to first field (normally ID) 
  // }
  let searches = [];
  if (spec.searches) { searches = spec.searches; }
  trace.log({ searches: spec.searches });

  let query = { xcollection: table };
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
      let re = `${value}.*`;
      item = { $regex: re }
      //      continue; 
    }
    if (compare == 'contains' || compare == 'like') {
      let re = `.*${value}.*`;
      item = { $regex: re }
      //     continue;
    }
    if (compare == 'equals' || compare == 'eq') {
      item = value
    }
    if (compare == 'less' || compare == 'lt') { item = { $lt: value } }
    if (compare == 'more' || compare == 'gt') { item = { $gt: value } }
    if (compare == 'le') { item = { $lte: value } }
    if (compare == 'ge') { item = { $gte: value } }
    if (compare == 'ne') { item = { $ne: value } }
    trace.log(spec);
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
  trace.log({ table: table, record: record, mode: mode, break: '+', })
  trace.log({ attributes: attributes, level: 'verbose' });
  let rec = {};

  for (let key of Object.keys(attributes)) {
    trace.log({ key: key, level: 'verbose' });
    trace.log(key, Array.isArray(record[key]), record[key], { level: 'verbose' });
    trace.log({
      key: key,
      type: attributes[key].type,
      array: attributes[key].array,
      collection: attributes[key].xcollection,
      val: record[key],
      num: Number(record[key]),
      isNan: isNaN(rec[key]),
      level: 'verbose'
    });

    /*** 
     * 
     *      Fix array - doesn't do much!
     * If this field is an array and the data is not - them ruen it into an aray 
     * The 'single' array type is where we store an array as a Javascript object 
     * rather than a real array. Hangover from SQL databases and unlileky yo be used
     * for Couch.
    */


    if (attributes[key].array) {
      if (attributes[key].array.type != 'single') {
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
          if (attributes[key].type == 'object' && record[key][i]) {
            trace.log({ key: key, i: i, subrecord: record[key][i], level: 'verbose' })
            rec[key][i] = await fixWrite(table, record[key][i], attributes[key].object, mode)
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
    /*** Not an array */
    else {
      trace.log(key, attributes[key].type, { level: 'verbose' })
      /** If this is an object call itself recursively until we get to a non-object  field */
      if (attributes[key].type == 'object' && record[key]) {
        trace.log('down a level', key, record[key]);
        rec[key] = await fixWrite(table, record[key], attributes[key].object, mode);
        trace.log(rec[key]);
      }
      //   if (!attributes[key]) { continue }   // skip field if not in database
      /*** Not an object or array */

      /** For new records, guarantee that they have every field */
      else {
        trace.log({ key: key, type: typeof record[key], level: 'verbose' });
        /** Make sure every field is there for new records */
        if (typeof record[key] === 'undefined' && mode == 'new') {
          if (key == '_id') {
            let uuids = await nano.uuids();
            trace.log({ uuids: uuids });
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
    trace.log({ key: key, old: record[key], new: rec[key] }, { level: 'verbose' })
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
  trace.log(record);
  if (record._id) { record._id = record._id.toString(); }
  for (let key of Object.keys(record)) {
    trace.log({ key: key, data: record[key], level: 'verbose' })
    if (!attributes[key]) { continue };                          // do nothing if item not in schema
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
      trace.log({ type: attributes[key].type, key: record[key], level: 'verbose' });
      if (attributes[key].type == 'object' && record[key]) {
        fixRead(record[key], attributes[key].object)
      }
      else {
        trace.log({ model: attributes[key].model, data: record[key], level: 'verbose' });
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
 * As many SQL databases don't have a count function this simply 
 * reads pagelength +1 records and returns the number read.
 * 
 * @param {string} table - Table name
 * @param {Object} spec - Filter specification - see get instruction above. 
 * @returns {number} Record count
 */
async function countRows(table, spec, offset) {
  trace.log({ input: arguments });
  let first = await getRows(table, spec, offset, suds.pageLength + 1);
  count = first.length;
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
  let result = 0;
  let records = getRows(table, spec);
  for (const i = 0; i < records.length; i++) { result += records[i][col] }
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
  trace.log({ inputs: arguments })
  let tableData = tableDataFunction(table);
  let attributes = mergeAttributes(table);
  let rec = await fixWrite(table, record, attributes, 'new');
  for (let key of Object.keys(attributes)) {
    if (attributes[key].process.createdAt) { rec[key] = Date.now() }
    if (attributes[key].process.updatedAt) { rec[key] = Date.now() }
  }
  rec['xcollection'] = table;
  delete rec._rev;   // not valid for insert
  trace.log('inserting:', rec);
  try {
    const result = await db.insert(rec);
    rec['_id'] = result.id;
    rec['_rev'] = result.rev;
    trace.log(result, rec);
    trace.log(typeof (rec._id));
    return (rec);
  }
  catch (err) {
    trace.error(`attempt to insert record in ${table} failed
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
      < h2 > Deleting records</h2 >
        <DIV CLASS="footerlinks">

          <button class="btn btn-primary" onclick="window.location='${suds.mainPage}?table=${table}&mode=list'">${lang.tableList}</button>
          <button class="btn btn-primary" onclick="window.location='${suds.mainPage}'">${lang.backToTables}</button>
        </DIV>
    `;
  }
  else {
    output = `
      < h2 > Deleting records failed - no search specification</h2 >

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
  if (typeof (id) == 'string') {
    id = objectifyId(id);
    trace.log({ id: id });
  }
  if (!mainPage) { mainPage = '/'; }
  let message = 'Deleting record';
  let rec;
  let rev;
  try {
    rec = await db.get(id)
    rev = rec._rev;
    console.log('destroying', id, rev)
    await db.destroy(id, rev);
  } catch (err) {
    console.log(`Database error deleting Row ${id} in table ${table} - retrying `);
    try {
      rec = await db.get(id)
      rev = rec._rev;
      console.log('destroying (2)', id, rev)
      await db.destroy(id, rev);
    }
    catch {
      console.log(err);
      throw new Error('second try failed')
    }
  }
  output = `
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
  trace.log({ inputs: arguments })
  let attributes = mergeAttributes(table, '', subschemas, additionalAttributes);
  let rec = await fixWrite(table, record, attributes, 'update');
  let filter = { _id: rec._id };
  if (!rec._id) {
    trace.log(rec);
    throw `Attempt to update record - missing id`
  }
  try {
    /**
     * Read the existing record wu=itg that key
     * Replace items in the update
     * This becomes the new record.
     */
    let oldrec = await getRow(table, rec._id);
    for (let key of Object.keys(rec)) {
      if (key == '_rev') continue;
      oldrec[key] = rec[key]
    }
    rec = oldrec;
    trace.log(rec);
    let result = await db.insert(rec);
    trace.log(result);
  }
  catch (err) {
    trace.warning(`Problem updating
    id: ${rec._id}
    rev: $rec._rev
  }
    retrying
    ${err} `);
    try {
      let oldrec = await getRow(table, rec._id);
      for (let key of Object.keys(rec)) {
        if (key == '_rev') continue;
        oldrec[key] = rec[key]
      }
      rec = oldrec;
      let result = await db.insert(rec);
      trace.log(result);
    }
    catch (err) {
      trace.error(`Problem updating ${rec._id} no update`, err);
    }
  }
  trace.log({ op: 'update ', table: table, filter: filter, record: rec });

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
  if (!val) {
    trace.error(`Attempt to read undefined record on ${table}`);
    return { err: 1, msg: 'Record not found' }
  }

  let tableData = tableDataFunction(table);
  let spec;
  if (typeof val == 'object') {
    spec = val;
  }
  else {
    if (!col) { col = tableData.primaryKey };
    trace.log(col, val);
    spec = { searches: [[col, 'eq', val]] };
  }
  trace.log(spec);
  let records = await getRows(table, spec);
  trace.log({ table: table, value: val, records: records });
  if (!records.length) { record = { err: 1, msg: 'Record not found' } }
  else { record = records[0] }
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
async function getRows(table, spec, offset, limit, sortKey, direction,) {

  trace.log({ input: arguments });
  if (spec && spec.view) return (await getView(table, spec, offset, limit, sortKey, direction,))
  if (!spec) { spec = {} }
  if (!limit && spec.limit) { limit = spec.limit }
  let rows = {};
  let instruction = { xcollection: table };
  let tableData = tableDataFunction(table);
  if (!sortKey && spec.sort) { sortKey = spec.sort[0]; }
  //  if (!sortKey) { sortKey = tableData.primaryKey; }
  if (!direction && spec.sort) { direction = spec.sort[1]; }
  if (!direction) { direction = 'DESC'; }
  if (spec && spec.searches && spec.searches.length) {
    if (!spec.instruction) {
      spec.instruction = getInstruction(table, spec);
    }
    instruction = spec.instruction;
  }
  trace.log({
    instruction: instruction,
    limit: limit,
    offset: offset,
    direction: direction,
    sortkey: sortKey
  });
  let options = { selector: instruction };
  if (sortKey) {
    let sortObj = {};
    trace.log({ direction: direction });
    if (direction == 'DESC') { sortObj[sortKey] = 'desc' } else { sortObj[sortKey] = 'asc' }
    options['sort'] = [sortObj];
  }
  if (limit && limit != -1) {
    options['limit'] = limit;
  }
  if (offset) {
    options['skip'] = offset;
  }
  trace.log(options);
  try {
    let result = await db.find(options);
    rows = result.docs;
  }
  catch (err) {
    trace.log(err);
    if (err.description.includes('No index exists for this sort,')) {
      let indexDef = { index: { fields: [sortKey] } }
      trace.error(`Creating index for ${sortKey}`);
      await db.createIndex(indexDef)
      try {
        let result = await db.find(options);
        rows = result.docs;
      }
      catch (err) {
        trace.error(`Error reading ${table} returning empty set.
        ${err} `);
        rows = [];
      }
    }
    else {
      trace.error(`Error reading ${table} returning empty set.
    ${err} `);
      rows = [];
    }
  }
  //    rows = await knex(table).whereRaw(instruction, bindings).orderBy(sortKey, direction).offset(offset).limit(limit);

  trace.log(rows);
  let attributes = rawAttributes(table);
  trace.log(attributes, { level: 'silly' });
  for (let i = 0; i < rows.length; i++) {
    fixRead(rows[i], attributes);  //rows[i] is an object so only address is passed
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
async function getView(table, spec, offset, limit, sortKey, direction,) {

  trace.log({ input: arguments });
  if (!limit && spec.limit) { limit = spec.limit }
  let rows = {};
  let options = {};
  if (spec.view.params) { options = spec.view.params }

  if (spec && spec.searches && spec.searches.length) {
    if (spec.searches.length != 1) {
      trace.warning('Searches on a view can only have one item');
    }
    else {
      if (typeof spec.view.key == 'string') {
      options['key'] = spec.searches[0][2];
      }
      else{
         options['startkey']=[spec.searches[0][2],''];
         options['endkey']=[spec.searches[0][2],'zzzzzzzzzzzzzz'];
      }
    }
  }

  /** sortkey doesn't apply and should not be used.  Use params instead... */
  if (!sortKey && spec.sort) { sortKey = spec.sort[0]; }
  if (!direction && spec.sort) { direction = spec.sort[1]; }
  if (direction && direction == 'DESC') { options['descending'] = true; }

  if (limit && limit != -1) {
    options['limit'] = limit;
  }
  if (offset) {
    options['skip'] = offset;
  }
  trace.log(options, spec.view.tableVia);
  rows = [];
  let result = await db.view(spec.view.design, spec.view.view, options);
  trace.log({ result: result });
  for (let i = 0; i < result.rows.length; i++) {
    rows[i] = result.rows[i].value;
    if (spec.view.key) {
      if (typeof spec.view.key == 'string'){
      rows[i][spec.view.key] = result.rows[i].key;
      }
      else{
        for (let j=0;j<spec.view.key.length; j++){
          rows[i][spec.view.key[j]] = result.rows[i].key[j];
        }
      }
    }
    rows[i]._id = rows[i].id = result.rows[i].id;
  }
  trace.log(rows);

  trace.log(rows);
  let attributes = rawAttributes(table);
  trace.log(attributes, { level: 'silly' });
  for (let i = 0; i < rows.length; i++) {
    fixRead(rows[i], attributes);  //rows[i] is an object so only address is passed
    trace.log('fixed read', rows[i], { level: 'verbose' });
  }
  return (rows);
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