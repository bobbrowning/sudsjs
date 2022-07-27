/**
 * Subjects collection
  */
module.exports = {
   friendlyName: 'Exam Subjects (denormalised version)',
   permission: { all: ['admin', 'demo', 'trainer'] },
   stringify: 'name',    // Summarise record content
   standardHeader: true, // Standard document header
   list: {
      columns: ['name', 'papers'],
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
         array: { type: 'multiple' },
         type: 'string',
         friendlyName: 'Papers',
      },
   },
}