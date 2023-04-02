
const trace = require('track-n-trace')

const suds = require('../../config/suds')

let db
function connect () {
  trace.log(suds.dbDriver, suds[suds.dbDriver])
  if (suds[suds.dbDriver].driverFile) {
    db = require('./dbdrivers/' + suds[suds.dbDriver].driverFile)
  } else {
    db = require('./dbdrivers/' + suds.dbDriver)
  }
  return db.connect()
}

function createTable () { return db.createTable(arguments[0], arguments[1]) }
function getRow () { return db.getRow(arguments[0], arguments[1], arguments[2]) }
function getRows () { return db.getRows(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]) }
function countRows () { return db.countRows(arguments[0], arguments[1], arguments[2]) }
function totalRows () { return db.totalRows(arguments[0], arguments[1], arguments[2]) }
function createRow () { return db.createRow(arguments[0], arguments[1]) }
function deleteRow () { return db.deleteRow(arguments[0], arguments[1], arguments[2]) }
function deleteRows () { return db.deleteRows(arguments[0], arguments[1]) }
function updateRow () { return db.updateRow(arguments[0], arguments[1], arguments[2], arguments[3]) }
function standardiseId () { return db.standardiseId(arguments[0]) }
function stringifyId () { return db.stringifyId(arguments[0]) }

let getView = getViewItem= function () { }
if (suds.dbDriver == 'couchdb') {
  getView = function () { return db.getView(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]) }
  getViewItem = function () { return db.getViewItem(arguments[0], arguments[1], arguments[2]) }
}

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
exports.stringifyId = stringifyId
exports.getView = getView
exports.getViewItem = getViewItem
