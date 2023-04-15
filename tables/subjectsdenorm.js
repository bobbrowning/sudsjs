/**
 * Subjects collection
  */
module.exports = {
   friendlyName: 'Course Subjects (structured version)',
   permission: { all: ['admin', 'demo', 'trainer', 'demod'] }, // 'trainer' and 'demod' have limited home pages
   stringify: 'name',                                         // Summarise record content
   list: {
      columns: ['name', 'papers'],                            // Columns listed on a normal list
   },
   properties: {
      /* This inserts a standard header from fragments.js
         The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
      $ref: '{{dbDriver}}Header',
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
         properties: {
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

