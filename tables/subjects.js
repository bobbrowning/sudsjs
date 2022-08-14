/**
 * Subjects collection
 */
module.exports = {
   permission: { all: ['admin', 'demo', 'trainer', 'demor'] },
   stringify: 'name',          // Summarise record content (can be a function, but in this case is a field name)
   standardHeader: true,       // Standard record header (creat date, last edit date, created by)
    list: {
      open: 'papers',             // When the record list is shown, the 'papers' child records are also listed 
      columns: ['name', 'notes'],  // In the tablular file listing only the name and notes are shown
   },
   attributes: {
      name: {
         type: 'string',
      },
      notes: {
         type: 'string',
         input: { type: 'textarea' }
      },
      /* 'papers' is not a real field. It refers to child records that link back to this record */
      papers: {                // Each subject has a number of papers (child records)
         collection: 'papers', // stored in the 'papers' file
         via: 'subject',       // where the foreig key is 'subject'
         friendlyName: 'Exam papers',
         collectionList: {
            columns: ['name', 'notes'],
         }
      },
   },
}