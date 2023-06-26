#!/usr/bin/env node
"use strict";
/**
 * www
 *
 * @name Entry
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
const app = require('./app');
const debug = require('debug')('base:server');
const http = require('http');
const suds = require('../config/suds.js');
const mergeAttributes = require('./suds/merge-attributes');
const trace = require('track-n-trace');
const db = require('./suds/db');
require('source-map-support').install();
/**
 * Get port from environment and store in Express.
 */
trace.log(process.argv, { level: 'verbose' });
console.log(`
${new Date().toLocaleString(suds.currency.locale)} 
Starting SUDSJS`);
for (const arg of process.argv.slice(2)) {
    const arg2 = arg.split('=');
    process.env[arg2[0]] = arg2[1];
}
trace.log(process.env, { level: 'verbose' });
const port = normalizePort(process.env.PORT || suds.port);
app.set('port', port);
require('dotenv').config();
// console.log(process.env);
/** Establish database connection */
trace.log({ required: db, level: 'verbose' });
db.connect();
trace.log({ connected: suds.dbDriver, level: 'verbose' });
process.on('uncaughtException', err => {
    console.error('There was an uncaught error', err);
    process.exit(1); // mandatory (as per the Node.js docs)
});
/**
 * Create HTTP server.
 */
const server = http.createServer(app);
/**
 * Listen on provided port, on all network interfaces.
 */
console.log(`
Listening on port ${port}
Logging format: ${suds.morgan.format}

`);
if (process.env.NODE_ENV) {
    console.log(`${process.env.NODE_ENV} mode`);
}
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
/* Compile and cache the schema to save time plater on  */
if (suds.start.precompileTables) {
    for (const table of (suds.tables)) {
        mergeAttributes(table);
        console.log(`${table} compiled`);
    }
}
/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        // named pipe
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}
/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}
/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3d3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2Jpbi93d3cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQTs7Ozs7R0FLRzs7QUFFSCxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDNUIsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBQzdDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtBQUM1QixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtBQUN6QyxNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQTtBQUMxRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDdEMsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQy9CLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3hDOztHQUVHO0FBRUgsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7QUFDN0MsT0FBTyxDQUFDLEdBQUcsQ0FBQztFQUNWLElBQUksSUFBSSxFQUFFLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2dCQUNqQyxDQUFDLENBQUE7QUFDakIsS0FBSyxNQUFNLEdBQUcsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtJQUN2QyxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0NBQy9CO0FBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7QUFDNUMsTUFBTSxJQUFJLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN6RCxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQTtBQUVyQixPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUE7QUFDMUIsNEJBQTRCO0FBQzVCLG9DQUFvQztBQUNwQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQTtBQUU3QyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDWixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7QUFFekQsT0FBTyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLENBQUMsRUFBRTtJQUNwQyxPQUFPLENBQUMsS0FBSyxDQUFDLDZCQUE2QixFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBQ2pELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxzQ0FBc0M7QUFDeEQsQ0FBQyxDQUFDLENBQUE7QUFDRjs7R0FFRztBQUVILE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUE7QUFFckM7O0dBRUc7QUFFSCxPQUFPLENBQUMsR0FBRyxDQUFDO29CQUNRLElBQUk7a0JBQ04sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNOztDQUVuQyxDQUFDLENBQUE7QUFDRixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFO0lBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsT0FBTyxDQUFDLENBQUE7Q0FDNUM7QUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ25CLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0FBQzNCLE1BQU0sQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFBO0FBRW5DLDBEQUEwRDtBQUMxRCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLEVBQUU7SUFDL0IsS0FBSyxNQUFNLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUNqQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssV0FBVyxDQUFDLENBQUE7S0FDakM7Q0FDRjtBQUNEOztHQUVHO0FBRUgsU0FBUyxhQUFhLENBQUUsR0FBRztJQUN6QixNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBRTlCLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ2YsYUFBYTtRQUNiLE9BQU8sR0FBRyxDQUFBO0tBQ1g7SUFFRCxJQUFJLElBQUksSUFBSSxDQUFDLEVBQUU7UUFDYixjQUFjO1FBQ2QsT0FBTyxJQUFJLENBQUE7S0FDWjtJQUVELE9BQU8sS0FBSyxDQUFBO0FBQ2QsQ0FBQztBQUVEOztHQUVHO0FBRUgsU0FBUyxPQUFPLENBQUUsS0FBSztJQUNyQixJQUFJLEtBQUssQ0FBQyxPQUFPLEtBQUssUUFBUSxFQUFFO1FBQzlCLE1BQU0sS0FBSyxDQUFBO0tBQ1o7SUFFRCxNQUFNLElBQUksR0FBRyxPQUFPLElBQUksS0FBSyxRQUFRO1FBQ25DLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSTtRQUNoQixDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQTtJQUVsQix1REFBdUQ7SUFDdkQsUUFBUSxLQUFLLENBQUMsSUFBSSxFQUFFO1FBQ2xCLEtBQUssUUFBUTtZQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLCtCQUErQixDQUFDLENBQUE7WUFDckQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNmLE1BQUs7UUFDUCxLQUFLLFlBQVk7WUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxvQkFBb0IsQ0FBQyxDQUFBO1lBQzFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDZixNQUFLO1FBQ1A7WUFDRSxNQUFNLEtBQUssQ0FBQTtLQUNkO0FBQ0gsQ0FBQztBQUVEOztHQUVHO0FBRUgsU0FBUyxXQUFXO0lBQ2xCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQTtJQUM3QixNQUFNLElBQUksR0FBRyxPQUFPLElBQUksS0FBSyxRQUFRO1FBQ25DLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSTtRQUNoQixDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUE7SUFDdkIsS0FBSyxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsQ0FBQTtBQUMvQixDQUFDIn0=