/**
 * Papers collection
  */

let suds = require('../config/suds');

module.exports = {
   permission: { all: ['admin', 'demo', 'trainer', 'demor', 'demod'] },
   friendlyName: 'Exam papers',
   stringify: async function (data) {
      return (data.name)
   },
   list: {
      columns: ['subject', 'name', 'notes'],
      stringify: 'name',
   },
   properties: {
      /* This inserts a standard header from fragments.js
         The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
      $ref: '{{dbDriver}}Header',
      subject: {
         model: 'subjects',
         input: { type: 'select' },
      },
      name: {
         type: 'string',
      },
      notes: {
         type: 'string',
         input: { type: 'textarea' }
      },
      results: {                // Each subject has a number of papers (child records)
         collection: 'results', // stored in the 'papers' file
         via: 'paper',       // where the foreign key is 'subject'
         friendlyName: 'Exam results',
         collectionList: {
         }
      },
   },
}