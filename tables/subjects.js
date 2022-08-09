/**
 * Subjects collection
 */
module.exports = {
   permission: { all: ['admin', 'demo', 'trainer','demor'] },
   stringify: 'name',          // Summarise record content
   standardHeader: true,       // Standard document header
   open: 'papers',             // When the record list is shown, the papers child records are also listed 
   list: {
   columns: ['name','notes'],  // In the tablular file listing only the name and notes are shown
   },
   attributes: {
      name: {
         type: 'string',
      },
      notes: {
         type: 'string',
         input: { type: 'textarea' }
      },
      papers: {                // Each subject has a number of papers (child records)
         collection: 'papers', // stored in the 'papers' file
         via: 'subject',       // where the foreig key is 'subject'
         friendlyName: 'Exam papers',
         collectionList: {
            columns: ['name','notes'],
         }
       },
      },
}