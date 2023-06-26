"use strict";
/**
 * Audit table Schema
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    description: `This table is maintained by the system to record every action. The table can get very 
  large, so it can be automatically trimmed.  The trimming rules are set in the suds configuration file.`,
    permission: { view: ['admin', 'demo'] },
    list: {
        columns: ['createdAt','updatedBy', 'tableName', 'mode'],
    },
    properties: {
        /* This inserts a standard header from fragments.js
           The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        tableName: {
            type: 'string',
            database: { type: 'varchar', length: 50, },
        },
        mode: {
            type: 'string',
            database: { type: 'varchar', length: 10, },
        },
        row: {
            type: 'string',
        },
        notes: {
            friendlyName: 'notes',
            type: 'string',
        },
        data: {
            type: 'string',
            input: { type: 'textarea' },
            process: { type: 'JSON' },
            database: { type: 'text' },
        },
    }
};
