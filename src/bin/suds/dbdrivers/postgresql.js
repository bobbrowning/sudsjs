
/** *********************************************
 * PostgreSQL database driver.
 * ********************************************** */
const Database__Driver = 'Postgresql' // To make documentation.js work...

const db = require('./sql-functions')
const knexUtils = require('knex-utils')

exports.connect = connect
exports.createTable = createTable
exports.getRow = getRow
exports.getRows = getRows
exports.countRows = countRows
exports.totalRows = totalRows
exports.createRow = createRow
exports.deleteRow = deleteRow
exports.deleteRows = deleteRows
exports.updateRow = updateRow
exports.standardiseId = standardiseId

const auth = require('../../../local/auth')
const trace = require('track-n-trace')
const suds = require('../../../config/suds')

function connect () {
  const spec = suds[suds.dbDriver]
  trace.log({ connect: spec })
  try {
    const connection = spec.connection
    connection.user = auth.postgresql.user
    connection.password = auth.postgresql.password
    trace.log({ client: 'pg', connection })
    globalThis.knex = require('knex')({
      client: 'pg',
      connection
    })
    console.log(`connected to ${spec.friendlyName} database`)
  } catch {
    console.log('Cant connect to ' + spec.friendlyName)
    process.exit(62)
  }

  knexUtils.checkHeartbeat(knex).then(
    function (heartbeat) {
      if (heartbeat.isOk) {
        console.log('Database alive and well')
      } else {
        console.log(heartbeat.error)
        console.log('Terminating process')
        process.exit(72)
      }
    }
  )
}
function createTable (a, b) { return db.createTable(a, b) }
function getRow (a, b, c) { return db.getRow(a, b, c) }
function getRows (a, b, c, d, e, f) { return db.getRows(a, b, c, d, e, f) }
function countRows (a, b) { return db.countRows(a, b) }
function totalRows (a, b, c) { return db.totalRows(a, b, c) }
function createRow (a, b) { return db.createRow(a, b) }
function deleteRow (a, b, c) { return db.deleteRow(a, b, c) }
function deleteRows (a, b, c) { return db.deleteRows(a, b, c) }
function updateRow (a, b) { return db.updateRow(a, b) }
function standardiseId (a) { return db.standardiseId(a) }
