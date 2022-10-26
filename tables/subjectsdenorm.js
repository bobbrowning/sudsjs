/**
 * Subjects collection
  */
module.exports = {
   friendlyName: 'Course Subjects (structured version)',
   permission: { all: ['admin', 'demo', 'trainer', 'demod'] }, // 'trainer' and 'demod' have limited home pages
   stringify: 'name',                                         // Summarise record content
   standardHeader: true,                                      // Standard document header
   list: {
      columns: ['name', 'papers'],                            // Columns listed on a normal list
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
         type: 'object',
         friendlyName: 'Exam paper',
         object: {
            name: {
               type: 'string',
            },
            notes: {
               type: 'string',
               input: { type: 'textarea' }
            },
         },
      },
   },
}

