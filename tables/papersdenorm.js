/**
 * Subjects collection
  */

let db = require('../bin/suds/db-mongo');
let lookup = require('../bin/suds/lookup-value');

module.exports = {
   permission: { all: ['admin', 'demo', 'trainer', 'demor', 'demod'] },
   friendlyName: 'Exam papers',
   standardHeader: true, // Standard document header
   stringify: 'name',  
   list: {
      columns: ['name', 'notes'],
      stringify: 'name',
   },
   attributes: {
      name: {
         type: 'string',
      },
      notes: {
         type: 'string',
         input: { type: 'textarea' }
      },
   },
}