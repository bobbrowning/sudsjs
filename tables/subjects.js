/**
 * Subjects collection
 */
module.exports = {
   permission: { all: ['admin', 'demo', 'trainer','demor'] },
   stringify: 'name',          // Summarise record content
   standardHeader: true,       // Standard document header
   open: 'papers',
   list: {
   columns: ['name','notes'],
   },
   attributes: {
      name: {
         type: 'string',
      },
      notes: {
         type: 'string',
         input: { type: 'textarea' }
      },
      papers: {                // Each subject has a number of papers
         collection: 'papers', // stored in the 'papers' file
         via: 'subject',       // where the foreig key is 'subject'
         friendlyName: 'Exam papers',
         collectionList: {
            columns: ['name','notes'],
         }
       },
      },
}