
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

exports.connect = connect
exports.createTable = createTable

exports.getRow = getRow
exports.getRows = getRows
exports.getView = getView
exports.getViewItem = getViewItem
exports.countRows = countRows
exports.totalRows = totalRows
exports.createRow = createRow
exports.deleteRow = deleteRow
exports.deleteRows = deleteRows
exports.updateRow = updateRow
exports.standardiseId = standardiseId
exports.stringifyId = stringifyId

let trace = require('track-n-trace')
const suds = require('../../../config/suds')
const tableDataFunction = require('../table-data')
const mergeAttributes = require('../merge-attributes')
const lang = require('../../../config/language').EN
const Nano = require('nano')
let nano
const collection = suds.couch.collectionField
const driverSubs = require('./driverSubs')

const rawAttributes = driverSubs.rawAttributes

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
//  url: `http://${auth.couch.user}:${auth.couch.password}@localhost:5984`,

function connect () {
  const auth = require('../../../local/auth')
  suds.dbType = 'nosql'
  const dbSpec = suds[suds.dbDriver]
  trace.log(dbSpec)
  const authSpec = auth[suds.dbDriver]
  try {
    let authString = ''
    if (authSpec) { authString = `${authSpec.user}:${authSpec.password}@` }
    const url = `http://${authString}${dbSpec.connection.host}`
    trace.log(url)
    const opts = {
      url,
      requestDefaults: dbSpec.connection.requestDefaults
    }
    nano = Nano(opts)

    db = nano.db.use(dbSpec.connection.database)
    console.log('Connected to CouchDB database ')
  } catch (err) {
    throw new Error('Database connected failed ')
  }

  nano.db.list().then(
    function (list) {
      trace.log({ list })
      if (list.includes(dbSpec.connection.database)) {
        console.log(`Database ${dbSpec.connection.database} alive and well`)
      } else {
        console.log(`Couch system doesn't include ${dbSpec.connection.database}`, trace.line('s'))
        process.exit(Number(trace.line()))
      }
    }
  )
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
 * Hangover from MongoDB - needs cleaning up...
 *
 * ******************************************** */

function stringifyId (id) {
  return id
}
function objectifyId (id) {
  return id
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

function getInstruction (table, spec) {
  trace.log({ input: arguments })

  const attributes = mergeAttributes(table)
  /* Rationalise the searchspec object */
  if (!spec.andor) { spec.andor = 'and' }
  // if (!spec.sort) {
  //   spec.sort = [Object.keys(tableData.attributes)[0], 'DESC'];  // sort defaults to first field (normally ID)
  // }
  let searches = []
  if (spec.searches) { searches = spec.searches }
  trace.log({ searches: spec.searches })

  let query = {}
  query[collection] = table
  if (spec.andor === 'or') { query = { $or: [] } }

  for (let i = 0; i < searches.length; i++) {
    let item = {}
    const searchField = searches[i][0]
    const compare = searches[i][1]
    let value = searches[i][2]
    let ta
    const qfield = searchField
    let path = [searchField]
    trace.log(searchField)
    if (searchField.includes('.')) {
      trace.log(`*********************** ${searchField} *****************`)
      path = searchField.split('.')
      let step = attributes[path[0]]
      for (let j = 1; j < path.length; j++) {
        step = step.object[path[j]]
        trace.log({ step })
      }
      ta = step
      trace.log(ta)
    } else {
      ta = attributes[searchField]
    }
    if (ta.model || searchField === '_id') {
      value = objectifyId(value)
    }
    trace.log({ searchField, path, qfield, compare, value })

    //   insensitive = ''
    //   if (suds.caseInsensitive) { insensitive = 'i' }
    if (compare === 'startsWith' || compare === 'startswith') {
      const re = `${value}.*`
      item = { $regex: re }
      //      continue;
    }
    if (compare === 'contains' || compare === 'like') {
      const re = `.*${value}.*`
      item = { $regex: re }
      //     continue;
    }
    if (compare === 'equals' || compare === 'eq') {
      item = value
    }
    if (compare === 'less' || compare === 'lt') { item = { $lt: value } }
    if (compare === 'more' || compare === 'gt') { item = { $gt: value } }
    if (compare === 'le') { item = { $lte: value } }
    if (compare === 'ge') { item = { $gte: value } }
    if (compare === 'ne') { item = { $ne: value } }
    trace.log(spec)
    if (spec.andor === 'and') {
      query[qfield] = item
    } else {
      const cond = {}
      cond[qfield] = item
      query.$or.push(cond)
    }
  }

  trace.log({ table, instruction: query })
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
async function fixWrite (table, record, attributes, mode) {
  trace.log({ table, record, mode, break: '+' })
  trace.log({ attributes, level: 'verbose' })
  const rec = {}

  for (const key of Object.keys(attributes)) {
    trace.log({ key, level: 'verbose' })
    trace.log(key, Array.isArray(record[key]), record[key], { level: 'verbose' })
    trace.log({
      key,
      type: attributes[key].type,
      array: attributes[key].array,
      collection: attributes[key][collection],
      val: record[key],
      num: Number(record[key]),
      isNan: isNaN(rec[key]),
      level: 'verbose'
    })

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
        trace.log(record[key], Array.isArray(record[key]), { level: 'verbose' })
        if (!Array.isArray(record[key])) {
          if (record[key]) {
            record[key] = [record[key]]
          } else {
            record[key] = []
          }
        }

        /** start with an empty array
         * If the elements of the array are objectes
         * call itself recursively ti process the objects.
         * otherwise just copy it.
         *
        */
        rec[key] = []
        trace.log(record[key])
        for (let i = 0; i < record[key].length; i++) {
          if (attributes[key].type === 'object' && record[key][i]) {
            trace.log({ key, i, subrecord: record[key][i], level: 'verbose' })
            rec[key][i] = await fixWrite(table, record[key][i], attributes[key].object, mode)
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
      /** * Not an array */
      trace.log(key, attributes[key].type, { level: 'verbose' })
      /** If this is an object call itself recursively until we get to a non-object  field */
      if (attributes[key].type === 'object' && record[key]) {
        trace.log('down a level', key, record[key])
        rec[key] = await fixWrite(table, record[key], attributes[key].object, mode)
        trace.log(rec[key])
      } else {
        //   if (!attributes[key]) { continue }   // skip field if not in database
        /** * Not an object or array */

        /** For new records, guarantee that they have every field */

        trace.log({ key, type: typeof record[key], level: 'verbose' })
        /** Make sure every field is there for new records */
        if (typeof record[key] === 'undefined' && mode === 'new') {
          if (key === '_id') {
            const uuids = await nano.uuids()
            trace.log({ uuids })
            record[key] = uuids.uuids[0]
            trace.log({ id: record[key] })
          } else {
            record[key] = null
          }
        }

        trace.log('final processing', {
          level: 'verbose'

        })
        if (typeof record[key] !== 'undefined') {
          rec[key] = record[key]
          if (attributes[key].type === 'number') {
            rec[key] = Number(record[key])
            if (isNaN(rec[key])) { rec[key] = 0 }
          }
          if (attributes[key].model) {
            if (rec[key] && rec[key] !== '0' && typeof (rec[key]) === 'string') { rec[key] = objectifyId(rec[key]) }
          }
          if (attributes[key].type === 'boolean') {
            if (rec[key]) { rec[key] = true } else { rec[key] = false }
          }
        }
      }
    }
    trace.log({ key, old: record[key], new: rec[key] }, { level: 'verbose' })
  }
  trace.log({ fixed: rec })
  return (rec)
}

/** ************************************************
 *
 * Fix any issues with the record read.
 *
 * *********************************************** */
function fixRead (record, attributes) {
  trace.log({ record: record, attributes: attributes, level: 's1' })
  if (record._id) { record._id = record._id.toString() }
  for (const key of Object.keys(record)) {
    trace.log({ key, data: record[key], level: 's1' })
    if (!attributes[key]) { continue }; // do nothing if item not in schema
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
        if (attributes[key].type === 'object' && record[key][i]) {
          trace.log({ key, i, subrecord: record[key][i] })
          if (!attributes[key].object && attributes[key].properties) { attributes[key].object = attributes[key].properties }
          fixRead(record[key][i], attributes[key].object)
        }
        if (attributes[key].model && record[key][i]) {
          record[key][i] = record[key][i].toString()
        }
      }
    } else {
      trace.log({ type: attributes[key].type, key: record[key], level: 'verbose' })
      if (attributes[key].type === 'object' && record[key]) {
        fixRead(record[key], attributes[key].object)
      } else {
        trace.log({ model: attributes[key].model, data: record[key], level: 'verbose' })
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
async function countRows (table, spec, offset) {
  trace.log({ input: arguments })
  const first = await getRows(table, spec, offset, suds.pageLength + 1)
  return (first.length)
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
  let result = 0
  const records = getRows(table, spec)
  for (let i = 0; i < records.length; i++) { result += records[i][col] }
  return result
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
  const attributes = mergeAttributes(table)
  const rec = await fixWrite(table, record, attributes, 'new')
  for (const key of Object.keys(attributes)) {
    if (attributes[key].process.createdAt) { rec[key] = Date.now() }
    if (attributes[key].process.updatedAt) { rec[key] = Date.now() }
  }
  rec[collection] = table
  delete rec._rev // not valid for insert
  trace.log('inserting:', rec)
  try {
    const result = await db.insert(rec)
    rec._id = result.id
    rec._rev = result.rev
    trace.log(result, rec)
    trace.log(typeof (rec._id))
    return (rec)
  } catch (err) {
    console.log(`attempt to insert record in ${table} failed
    ${err} `)
    return (rec)
  }
}

/**
 * Delete Rows
 * @param {string} table
 * @param {object} spec - see above
 * @returns {string} HTML output
 */
async function deleteRows (table, spec) {
  trace.log({ input: arguments })
  const oldRows = getRows(table, spec)
  for (const row of oldRows) {
    deleteRow(table, row._id)
  }
  return ('done')
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
  let mainPage = suds.mainPage
  if (typeof (id) === 'string') {
    id = objectifyId(id)
    trace.log({ id })
  }
  if (!mainPage) { mainPage = '/' }
  const message = 'Deleting record'
  let rec
  let rev
  try {
    rec = await db.get(id)
    rev = rec._rev
    console.log('destroying', id, rev)
    await db.destroy(id, rev)
  } catch (err) {
    console.log(`Database error deleting Row ${id} in table ${table} - retrying `)
    try {
      rec = await db.get(id)
      rev = rec._rev
      console.log('destroying (2)', id, rev)
      await db.destroy(id, rev)
    } catch {
      console.log(err)
      throw new Error('second try failed')
    }
  }
  const output = `
      <h2> ${message}</h2>
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
  let rec = await fixWrite(table, record, attributes, 'update')
  const filter = { _id: rec._id }
  if (!rec._id) {
    trace.log(rec)
    throw new Error('Attempt to update record - missing id')
  }
  try {
    /**
     * Read the existing record wu=itg that key
     * Replace items in the update
     * This becomes the new record.
     */
    const oldrec = await getRow(table, rec._id)
    for (const key of Object.keys(rec)) {
      if (key === '_rev') continue
      oldrec[key] = rec[key]
    }
    rec = oldrec
    trace.log(rec)
    const result = await db.insert(rec)
    trace.log(result)
  } catch (err) {
    console.log(`** warning ** Problem updating
    id: ${rec._id}
    rev: $rec._rev
  }
    retrying
    ${err} `)
    try {
      const oldrec = await getRow(table, rec._id)
      for (const key of Object.keys(rec)) {
        if (key === '_rev') continue
        oldrec[key] = rec[key]
      }
      rec = oldrec
      const result = await db.insert(rec)
      trace.log(result)
    } catch (err) {
      console.log(`Problem updating ${rec._id} no update`, err)
    }
  }
  trace.log({ op: 'update ', table, filter, record: rec })
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
  let record
  if (!val) {
    console.log(`Attempt to read undefined record on ${table}`)
    return { err: 1, msg: 'Record not found' }
  }

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
  if (spec && spec.view) return (await getView(table, spec, offset, limit, sortKey, direction))
  if (!spec) { spec = {} }
  if (!limit && spec.limit) { limit = spec.limit }
  let rows = {}
  let instruction = {}
  instruction[collection] = table
  // const tableData = tableDataFunction(table)
  if (!sortKey && spec.sort) { sortKey = spec.sort[0] }
  //  if (!sortKey) { sortKey = tableData.primaryKey; }
  if (!direction && spec.sort) { direction = spec.sort[1] }
  if (!direction) { direction = 'DESC' }
  if (spec && spec.searches && spec.searches.length) {
    if (!spec.instruction) {
      spec.instruction = getInstruction(table, spec)
    }
    instruction = spec.instruction
  }
  trace.log({
    instruction,
    limit,
    offset,
    direction,
    sortkey: sortKey
  })
  const options = { selector: instruction }
  if (sortKey) {
    const sortObj = {}
    trace.log({ direction })
    if (direction === 'DESC') { sortObj[sortKey] = 'desc' } else { sortObj[sortKey] = 'asc' }
    options.sort = [sortObj]
  }
  if (limit && limit !== -1) {
    options.limit = limit
  }
  if (offset) {
    options.skip = offset
  }
  trace.log(options)
  try {
    let startTime = new Date().getTime()
    trace.log({ where: 'Start of read', collection: table, options: options, level: 'timer' }) // timing
    const result = await db.find(options)
    rows = result.docs
    trace.log({ records: rows.length, 'Elapsed time (ms)': new Date().getTime() - startTime, level: 'timer', })
  } catch (err) {
    trace.log(err)
    if (err.description.includes('No index exists for this sort,')) {
      const indexDef = { index: { fields: [sortKey] } }
      console.log(`Creating index for ${sortKey}`)
      await db.createIndex(indexDef)
      try {
        const result = await db.find(options)
        rows = result.docs
      } catch (err) {
        console.log(`Error reading ${table} returning empty set.
        ${err} `)
        rows = []
      }
    } else {
      console.log(`Error reading ${table} returning empty set.
    ${err} `)
      rows = []
    }
  }
  //    rows = await knex(table).whereRaw(instruction, bindings).orderBy(sortKey, direction).offset(offset).limit(limit);

  trace.log(rows)
  const attributes = rawAttributes(table)
  trace.log(attributes, { level: 'silly' })
  for (let i = 0; i < rows.length; i++) {
    fixRead(rows[i], attributes) // rows[i] is an object so only address is passed
    trace.log('fixed read', rows[i], { level: 'verbose' })
  }
  return (rows)
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
async function getView (table, spec, offset, limit, sortKey, direction) {
  trace.log({ input: arguments })
  if (!limit && spec.limit) { limit = spec.limit }
  let options = {}
  if (spec.view.params) { options = spec.view.params }

  if (spec && spec.searches && spec.searches.length) {
    if (spec.searches.length !== 1) {
      throw new Error('** Warning ** Searches on a view can only have one item')
    } else {
      if (typeof spec.view.key === 'string') {
        options.key = spec.searches[0][2]
      } else {
        options.startkey = [spec.searches[0][2], '']
        options.endkey = [spec.searches[0][2], 'zzzzzzzzzzzzzz']
      }
    }
  }
  /** sortkey doesn't apply and should not be used.  Use params instead... */
  if (!sortKey && spec.sort) { sortKey = spec.sort[0] }
  if (!direction && spec.sort) { direction = spec.sort[1] }
  if (direction && direction === 'DESC') { options.descending = true }

  if (limit && limit !== -1) {
    options.limit = limit
  }
  if (offset) {
    options.skip = offset
  }
  trace.log(spec.view.design, spec.view.view, options)
  let startTime = new Date().getTime()
  trace.log({ where: 'Start of read', collection: table, options: options, level: 'timer' }) // timing
  const result = await db.view(spec.view.design, spec.view.view, options)
  trace.log({ records: result.rows.length, 'Elapsed time (ms)': new Date().getTime() - startTime, level: 'timer', })
  trace.log({ result })
  /** Loop through the results which are an bject containing id, key and value. 
   * If the value is a string
   */
  let rows = fixViewResult(result, spec)
  trace.log(rows)

  const attributes = rawAttributes(table)
  trace.log(attributes, { level: 'silly' })
  for (let i = 0; i < rows.length; i++) {
    fixRead(rows[i], attributes) // rows[i] is an object so only address is passed
    trace.log('fixed read', rows[i], { level: 'verbose' })
  }
  return (rows)
}

function fixViewResult (result, spec) {
  trace.log({ result })
  let rows = []
  /** Loop through the results which are an object containing id, key and value. 
   *  Extrct the rows
   */
  for (let i = 0; i < result.rows.length; i++) {
    rows[i] = result.rows[i].value
    if (spec.view.key) {
      if (typeof spec.view.key === 'string') {
        rows[i][spec.view.key] = result.rows[i].key
      } else {
        for (let j = 0; j < spec.view.key.length; j++) {
          rows[i][spec.view.key[j]] = result.rows[i].key[j]
        }
      }
    }
    rows[i]._id = rows[i].id = result.rows[i].id
  }
  trace.log(rows)
  return rows;
}


/**
 * Get one item from a view given the key or keys
 * @param {string} design 
 * @param {string} view 
 * @param {string or array} id 
 */
async function getViewItem (design, view, id) {
  if (typeof id === 'string') { id = [id] }
  const result = await db.view(design, view, { keys: id })
  let spec = {}
  let rows = fixViewResult(result, spec)

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
async function createTable () {
  // trace.log({ input: arguments });
  return ('not required for couch')
}
