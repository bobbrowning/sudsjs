/**
 * Subjects collection
  */
module.exports = {
   permission: { all: ['admin', 'demo', 'trainer'] },
   stringify: 'name',    // Summarise record content
   standardHeader: true, // Standard document header
   attributes: {
      name: {
         type: 'string',
      },
      notes: {
         type: 'string',
         input: { type: 'textarea' }
      },
   },
}