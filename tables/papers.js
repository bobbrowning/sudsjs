/**
 * Subjects collection
  */

 let db = require('../bin/suds/db-mongo');
 let lookup = require('../bin/suds/lookup-value');
 
module.exports = {
   permission: { all: ['admin', 'demo', 'trainer','demor','demod'] },
   friendlyName: 'Exam papers',
   stringify: async function (data) {
      let subject = await db.getRow('subjects', data.subject);
         return (data.name)
  },
standardHeader: true, // Standard document header
   list: {
   columns: ['subject','name','notes'],
   stringify: 'name',
   },
   attributes: {
      subject: {
         model: 'subjects',
         input: {type: 'select'},
      },
     name: {
         type: 'string',
      },
      notes: {
         type: 'string',
         input: { type: 'textarea' }
      },
   },
}