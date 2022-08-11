/**
 * Subjects collection
  */
module.exports = {
   friendlyName: 'Course Subjects (structured version)',
   permission: { all: ['admin', 'demo', 'trainer','demod'] },
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
         model: 'papersdenorm',
         type: 'string',
         friendlyName: 'Exam papers',
         input: {type: 'select'}
      },
   },
}