#!/usr/bin/env node

/**
 * www
 *
 * @name Entry
 *
 */

const app = require('./app')
const debug = require('debug')('base:server')
const http = require('http')
const suds = require('../config/suds.js')
const mergeAttributes = require('./suds/merge-attributes')
const trace = require('track-n-trace')
const db = require('./suds/db')
require('source-map-support').install();
/**
 * Get port from environment and store in Express.
 */

trace.log(process.argv, { level: 'verbose' })
console.log(`
${new Date().toLocaleString(suds.currency.locale)} 
Starting SUDSJS`)
for (const arg of process.argv.slice(2)) {
  const arg2 = arg.split('=')
  process.env[arg2[0]] = arg2[1]
}
trace.log(process.env, { level: 'verbose' })
const port = normalizePort(process.env.PORT || suds.port)
app.set('port', port)

require('dotenv').config()
// console.log(process.env);
/** Establish database connection */
trace.log({ required: db, level: 'verbose' })

db.connect()
trace.log({ connected: suds.dbDriver, level: 'verbose' })

process.on('uncaughtException', err => {
  console.error('There was an uncaught error', err)
  process.exit(1) // mandatory (as per the Node.js docs)
})
/**
 * Create HTTP server.
 */

const server = http.createServer(app)

/**
 * Listen on provided port, on all network interfaces.
 */

console.log(`
Listening on port ${port}
Logging format: ${suds.morgan.format}

`)
if (process.env.NODE_ENV) {
  console.log(`${process.env.NODE_ENV} mode`) 
}
server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

/* Compile and cache the schema to save time plater on  */
if (suds.start.precompileTables) { 
  for (const table of (suds.tables)) {
    mergeAttributes(table)
    console.log(`${table} compiled`)
  }
}
/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort (val) {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening () {
  const addr = server.address()
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  debug('Listening on ' + bind)
}
