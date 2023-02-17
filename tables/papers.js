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
   standardHeader: true, // Standard document header
   list: {
      columns: ['subject', 'name', 'notes'],
      stringify: 'name',
   },
   attributes: {
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