/**
 * Audit table Schema
 *
 */

module.exports = {

  description: `This table is maintained by the system to record every action. The table can get very 
  large, so it can be automatically trimmed.  The trimming rules are set in the suds configuration file.`,

  permission: { view: ['admin', 'demo'] },
  list: {
    columns: ['_id', 'createdAt', 'tableName', 'mode', 'row'],
  },
  attributes: {
    _id: {
      friendlyName: 'Number',                            // Visible name 
      type: 'object',
      autoincrement: true,
      primaryKey: true,
    },
    createdAt: {
      friendlyName: 'Date created',
      type: 'number',
      display: { type: 'datetime', truncateForTableList: 16 },
      database: { type: 'biginteger' },
      process: { createdAt: true }
    },                                      // You don't actually enter these
    updatedAt: {                            // but if you did they would be dates. 
      friendlyName: 'Date last updated',    // so this also governs how they are diaplayed
      type: 'number',
      display: { type: 'datetime', truncateForTableList: 16 },
      database: { type: 'biginteger' },
      process: { updatedAt: true }
    },
    updatedBy: {
      friendlyName: 'Last updated by',
      description: `The person who last updated the row.`,
      type: 'string',
      model: 'user',
      process: { updatedBy: true }
    },
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
      display: { type: 'JSON' },
      //     database: { type: 'longtext' },
    },
  }
}




