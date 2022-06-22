/**
 * Audit table Schema
 *
 */

module.exports = {

  description: `This table is maintained by the system to record every action. The table can get very 
  large, so it can be automatically trimmed.  The trimming rules are set in the suds configuration file.`,

  permission: { view: ['admin', 'demo'] },
  list: {
    columns: ['id', 'createdAt', 'tableName', 'mode', 'row'],
  }, 
  standardHeader: true,
  attributes: {
     tableName: {
      type: 'string',
      database: { type: 'varchar', length: 50, },
    },
    mode: {
      type: 'string',
      database: { type: 'varchar', length: 10, },
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
      input: { type: 'textarea' },
      display: { type: 'JSON' },
      //     database: { type: 'longtext' },
    },
  }
}




