/**
 * Audit.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  description: 'Audit trail file',
  description: `This table is maintained by the system to record every action. The table can get very 
  large, so it can be automatically trimmed.  The trimming rules are set in the suds configuration file.`,
  permission: {view: ['admin','support']},
 list: {
  columns: ['id','createdAt','tableName','mode','row'],
 },
  attributes: {
    id: {
      friendlyName: 'Number',                            // Visible name 
      type: 'number',
      autoincrement: true,
      primaryKey: true,
    },
    createdAt: {
      friendlyName: 'Date created',
      type: 'number',
      display: { type: 'datetime',truncateForTableList: 16 },
      database: { type: 'biginteger' },
      process: { createdAt: true }
    },                                      // You don't actually enter these
    updatedAt: {                            // but if you did they would be dates. 
      friendlyName: 'Date last updated',    // so this also governs how they are diaplayed
      type: 'number',
      display: { type: 'datetime',truncateForTableList: 16 },
      database: { type: 'biginteger' },
      process: { updatedAt: true }
    },
    updatedBy: {
      friendlyName: 'Last updated by',
      description: `The person who last updated the row.`,
      type: 'number',
      model: 'user',
      process: { updatedBy: true }
    },
    tableName: {
      type: 'string',
      database: { type: 'tinytext' },
    },
    mode: {
      type: 'string',
      database: { type: 'tinytext', length: 10, },
    },
    row: {
      type: 'number',
    },
    notes: {
      friendlyName: 'notes',
      type: 'string',
    },
    data: {
      type: 'string',
      database: { type: 'longtext' },
    },
  }
}




