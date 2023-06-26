
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
const Generic_Database__Driver = 'firebase' // To make documentation.js work...

exports.connect = connect
exports.createTable = createTable

exports.createRow = createRow
exports.getRow = getRow
exports.getRows = getRows
exports.countRows = countRows
exports.totalRows = totalRows
exports.deleteRow = deleteRow
exports.deleteRows = deleteRows
exports.updateRow = updateRow
exports.standardiseId = standardiseId

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')
let trace = require('../../node_modules/track-n-trace')
const suds = require('../../config/suds')
const tableDataFunction = require('./table-data')
const mergeAttributes = require('./merge-attributes')
const lang = require('../../config/language').EN
let db

/** *********************************************
 *
 * Connect to database
 *
 * No parameters. The database specification is in
 * /config/suds.js.  Connects to the database and sets up
 * a global 'knex'
 *
 * ********************************************* */

async function connect () {
  suds.dbType = 'nosql'
  const serviceAccountKey = suds.database.keyFile
  try {
    const serviceAccount = require('../../config/' + serviceAccountKey)

    initializeApp({
      credential: cert(serviceAccount)
    })

    globalThis.database = getFirestore()
    console.log('Connected successfully to Firestore database server')
  } catch (err) {
    console.log('Firestore database connected failed', err)
  }
}

/**
 *
 * Quick attributes object without any processing
 * @param {string} table
 * @returns
 */
function rawAttributes (table) {
  const tableData = require('../../tables/' + table)
  standardHeader = {}
  if (tableData.standardHeader) {
    standardHeader = require('../../config/standard-header')
  }
  const combined = { ...standardHeader, ...tableData.attributes }
  return (combined)
}

/** *********************************************
 *
 * Given a representation of the record key, returns
 * the standard format. Basically a stub for mongo
 * @param {undefined} Record key
 *
 * ******************************************** */
function standardiseId (id) {
  return id
}

/** *********************************************
 *
 * Given a representation of the record key, returns
 * the format that can be p[assed in a URL
 * @param {undefined} Record key
 *
 * ******************************************** */

function xstringifyId (id) {
  let value
  if (suds.dbDriverKey == 'objectId') {
    value = id.toString()
  } else {
    value = id
  }
  return value
}
function objectifyId (id) {
  let value
  if (suds.dbDriverKey == 'objectId') {
    try { value = ObjectId(id) } catch (err) {
      value = '000000000000' // valid but won't return anything
      trace.error(err)
    }
  } else {
    value = id
  }
  return value
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

function getInstruction (table, spec) {
  trace.log({ input: arguments })

  const attributes = rawAttributes(table)
  /* Rationalise the searchspec object */
  if (!spec.andor) { spec.andor = 'and' }
  if (spec.andor == 'or') {
    throw 'Firestore does not support "OR" queries'
  }
  // if (!spec.sort) {
  //   spec.sort = [Object.keys(tableData.attributes)[0], 'DESC'];  // sort defaults to first field (normally ID)
  // }
  let searches = []
  if (spec.searches) { searches = spec.searches }
  trace.log({ searches })

  let query = database.collection(table)
  const b = 0
  for (let i = 0; i < searches.length; i++) {
    const item = {}
    const searchField = searches[i][0]
    const compare = searches[i][1]
    const value = searches[i][2]
    const ta = attributes[searchField]
    //   if (ta.model || searchField == 'id') {
    //     value = objectifyId(value)
    //   }
    trace.log({ searchField, compare, value })

    insensitive = ''
    if (suds.caseInsensitive) { insensitive = 'i' }
    if (compare == 'startsWith' ||
      compare == 'startswith' ||
      compare == 'contains' ||
      compare == 'like') {
      throw 'Firestore does not support partial text queries'
    }
    let comp = '=='

    if (compare == 'less' || compare == 'lt') { comp = '<' }
    if (compare == 'more' || compare == 'gt') { comp = '>' }
    if (compare == 'le') { comp = '<=' }
    if (compare == 'ge') { comp = '>=' }
    if (compare == 'ne') { comp = '!=' }
    trace.log(searchField, comp, value)
    query = query.where(searchField, comp, value)
    //   console.log(query._queryOptions.fieldFilters);
  }
  return (query)
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
function fixWrite (table, record, attributes, mode) {
  trace.log({ table, record, mode, break: '+' })
  trace.log({ attributes, level: 'verbose' })
  const rec = {}
  if (record.id && typeof (record.id) === 'string' && mode != 'new') {
    rec.id = objectifyId(record.id)
    trace.log({ id: rec.id })
  }
  for (const key of Object.keys(attributes)) {
    trace.log(key)
    if (attributes[key].collection) { continue } // Not a real field
    if (key == 'id') { continue } // Done already
    trace.log(key, Array.isArray(record[key]), record[key])
    if (attributes[key].array &&
      attributes[key].array.type != 'single' &&
      !Array.isArray(record[key])) {
      record[key] = [record[key]]
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
    })

    if (attributes[key].array) {
      if (attributes[key].array.type != 'single') {
        trace.log(record[key], Array.isArray(record[key]))
        if (!Array.isArray(record[key])) {
          if (record[key]) {
            record[key] = [record[key]]
          } else {
            record[key] = []
          }
        }
        rec[key] = []
        trace.log(record[key])
        for (let i = 0; i < record[key].length; i++) {
          if (attributes[key].type == 'object' && record[key][i]) {
            trace.log({ key, i, subrecord: record[key][i] })
            rec[key][i] = fixWrite(table, record[key][i], attributes[key].object, mode)
          } else {
            rec[key][i] = record[key][i]
          }
        }
        trace.log(record[key], rec[key])
      } else {
        /** single means the record value will be a JSON string.  So don't go any deeper.. */
        rec[key] = record[key]
      }
    } else {
      trace.log(attributes[key].type)
      if (attributes[key].type == 'object' && record[key]) {
        trace.log('down a level', key, record[key])
        rec[key] = fixWrite(table, record[key], attributes[key].object, mode)
        trace.log(rec[key])
      }
      //   if (!attributes[key]) { continue }   // skip field if not in database
      /** For new records, guarantee that they have every field */
      else {
        trace.log(typeof record[key])
        if (typeof record[key] === 'undefined' && mode == 'new') {
          record[key] = null
        }
        trace.log('final processing')
        if (typeof record[key] !== 'undefined') {
          rec[key] = record[key]
          if (attributes[key].type == 'number') {
            rec[key] = Number(record[key])
            if (isNaN(rec[key])) { rec[key] = 0 }
          }
          if (attributes[key].model) {
            if (rec[key] && rec[key] != '0' && typeof (rec[key]) === 'string') { rec[key] = objectifyId(rec[key]) }
          }
          if (attributes[key].type == 'boolean') {
            if (rec[key]) { rec[key] = true } else { rec[key] = false }
          }
        }
      }
    }
    trace.log({ key, old: record[key], new: rec[key] })
  }
  trace.log({ fixed: rec })
  return (rec)
}

/** ************************************************
 *
 * Fix any iassues with the record read.
 * Change ObjectId to string
 *
 * *********************************************** */
function fixRead (record, attributes) {
  trace.log(record)
  if (record.id) { record.id = record.id.toString() }
  for (const key of Object.keys(record)) {
    trace.log({ key, data: record[key], level: 'verbose' })
    if (!attributes[key]) { continue }; // do nothing if item not in schema
    trace.log({ array: attributes[key].array, data: record[key] })
    if (attributes[key].array) {
      trace.log(record[key])
      if (!Array.isArray(record[key])) {
        if (record[key]) {
          record[key] = [record[key]]
        } else {
          record[key] = []
        }
      }
      for (let i = 0; i < record[key].length; i++) {
        if (attributes[key].type == 'object' && record[key][i]) {
          trace.log({ key, i, subrecord: record[key][i] })
          fixRead(record[key][i], attributes[key].object)
        }
        if (attributes[key].model && record[key][i]) {
          record[key][i] = record[key][i].toString()
        }
      }
    } else {
      trace.log(attributes[key].type, record[key])
      if (attributes[key].type == 'object' && record[key]) {
        fixRead(record[key], attributes[key].object)
      } else {
        trace.log({ model: attributes[key].model, data: record[key] })
        if (attributes[key].model && record[key]) {
          record[key] = record[key].toString()
          trace.log({ key, data: record[key], level: 'verbose' })
        }
      }
    }
    trace.log({ key, data: record[key], level: 'verbose' })
  }
  trace.log(record)
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

async function createRow (table, record) {
  trace.log({ inputs: arguments })
  const tableData = tableDataFunction(table)
  const attributes = mergeAttributes(table)
  const rec = fixWrite(table, record, attributes, 'new')
  for (const key of Object.keys(attributes)) {
    if (attributes[key].process.createdAt) { rec[key] = Date.now() }
    if (attributes[key].process.updatedAt) { rec[key] = Date.now() }
  }
  trace.log('inserting:', table, rec)
  const result = await database.collection(table).add(rec)
  trace.log(result, result)
  trace.log(typeof (result.id))
  return (rec)
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
async function countRows (table, spec) {
  trace.log({ input: arguments })
  return (100)
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
async function totalRows (table, spec, col) {
  trace.log({ input: arguments })
  const collection = database.collection(table)
  let total = 0
  let query = {}
  if (spec) {
    query = getInstruction(table, spec)
    trace.log(query)
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
    ]).toArray()
  } catch (err) {
    console.log(err)
  }
  trace.log({ total })
  if (!total.length) return (0)
  return (total[0].result)
}

/**
 * Delete Rows
 * @param {string} table
 * @param {object} spec - see above
 * @returns {string} HTML output
 */
async function deleteRows (table, spec) {
  trace.log({ input: arguments })
  const collection = database.collection(table)

  if (spec && spec.searches.length) {
    if (!spec.instruction) {
      spec.instruction = getInstruction(table, spec)
    }
    const instruction = spec.instruction
    trace.log(instruction)

    try {
      collection.deleteMany(instruction)
    } catch (err) {
      console.log(`Database error deleting Rows in table ${table} `, err)
      message = 'Unexpected error 51'
    }
    output = `
      <h2>Deleting records</h2>
      <DIV CLASS="footerlinks">
     
       <button class="btn btn-primary" onclick="window.location='${suds.mainPage}?table=${table}&mode=list'">${lang.tableList}</button>
           <button class="btn btn-primary" onclick="window.location='${suds.mainPage}'">${lang.backToTables}</button>
    </DIV>
  `
  } else {
    output = `
      <h2>Deleting records failed - no search specification</h2>
       
      <DIV CLASS="footerlinks">
     
       <button class="btn btn-primary" onclick="window.location='${suds.mainPage}?table=${table}&mode=list'">${lang.tableList}</button>
           <button class="btn btn-primary" onclick="window.location='${suds.mainPage}'">${lang.backToTables}</button>
    </DIV>
  `
  }
  return (output)
}

/**
 * Delete one row
 * @param {*} permission set
 * @param {*} table
 * @param {*} id - primary key
 * @returns {string} HTML
 */
async function deleteRow (permission, table, id) {
  trace = require('track-n-trace')
  trace.log({ start: 'Delete table row', inputs: arguments, break: '#', level: 'min' })
  const collection = database.collection(table)
  let mainPage = suds.mainPage
  const tableData = tableDataFunction(table)
  if (typeof (id) === 'string') {
    id = objectifyId(id)
    trace.log({ id })
  }
  if (!mainPage) { mainPage = '/' }
  let message = 'Deleting record'

  try {
    await collection.deleteOne({ id })
  } catch (err) {
    console.log(`Database error deleting Row ${id} in table ${table} `, err)
    message = 'Unexpected error 51'
  }
  output = `
      <h2>${message}</h2>
      <DIV CLASS="footerlinks">
     
       <button class="btn btn-primary" onclick="window.location='${mainPage}?table=${table}&mode=list'">${lang.tableList}</button>
           <button class="btn btn-primary" onclick="window.location='${mainPage}'">${lang.backToTables}</button>
    </DIV>
  `
  return (output)
}

/**
 * Update one row in a table
 * @param {string} table
 * @param {object} record
 */
async function updateRow (table, record, subschemas, additionalAttributes) {
  trace.log({ inputs: arguments })
  const attributes = mergeAttributes(table, '', subschemas, additionalAttributes)
  const rec = fixWrite(table, record, attributes, 'update')
  const filter = { id: rec.id }
  try {
    const ref = database.collection(table).doc(rec.id)
    const res = await ref.update(rec)
    trace.log(res)
  } catch (err) {
    console.log(`Problem updating ${rec.id} in ${table}`, err)
  }
  trace.log({ op: 'update ', table, filter, record: rec })
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
async function getRows (table, spec, offset, limit, sortKey, direction) {
  trace.log({ input: arguments })
  const collection = database.collection(table)

  if (!limit && spec.limit) { limit = spec.limit }
  let rows = []
  const options = {}
  const instruction = {}
  const tableData = tableDataFunction(table)
  if (!sortKey && spec.sort) { sortKey = spec.sort[0] }
  if (!sortKey) { sortKey = tableData.primaryKey }
  if (!direction && spec.sort) { direction = spec.sort[1] }
  if (!direction) { direction = 'DESC' }

  queryRef = spec.ref = getInstruction(table, spec)

  trace.log({ instruction: queryRef, limit, offset })
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
    trace.log('getting')
    snapshot = await queryRef.get()
    trace.log(snapshot)
    // console.log(snapshot.docs)
  } catch (err) {
    console.log(`Error reading ${table}

    ${err}`)
  }
  let i = 0
  rows = []
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data())
    rows[i] = doc.data()
    rows[i++].id = doc.id
  })
  const attributes = rawAttributes(table)
  trace.log(attributes, { level: 'silly' })
  for (let i = 0; i < rows.length; i++) {
    fixRead(rows[i], attributes) // rows[i] is an object so only address is passed
    trace.log('fixed read', rows[i], { level: 'verbose' })
  }

  trace.log(rows)
  return (rows)
}

/**
 * Get a single row from the database
 * @param {string} table
 * @param {number} row to be selected - normally the primary key
 * @param {number} Optional - field to be searched if not the primary key
 * @returns {object} The row
 */
async function getRow (table, val, col) {
  trace.log({ inputs: arguments })

  const tableData = tableDataFunction(table)
  let spec
  if (typeof val === 'object') {
    spec = val
  } else {
    if (!col) { col = tableData.primaryKey };
    trace.log(col, val)
    spec = { searches: [[col, 'eq', val]] }
  }
  trace.log(spec)
  const records = await getRows(table, spec)
  trace.log({ table, value: val, records })
  if (!records.length) { record = { err: 1, msg: 'Record not found' } } else { record = records[0] }
  trace.log('fixed read', record)
  return (record)
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
async function createTable (req, res) {
  // trace.log({ input: arguments });
  return ('not required for mongo')
}
