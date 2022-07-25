/**
 * Subjects collection
  */
module.exports = {
   permission: { all: ['admin', 'demo', 'trainer'] },
   stringify: 'name',    // Summarise record content
   standardHeader: true, // Standard document header
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
      papers: {
         collection: 'papers',
         via: 'subject',
       },
      },
}