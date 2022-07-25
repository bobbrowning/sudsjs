/**
 * 
 * Student table - normalised moned
 * 
 */
 let db = require('../bin/suds/db-mongo');
module.exports = {
    description: 'Exam results',

    friendlyName: 'Exam results',
    permission: { all: ['admin', 'demo', 'trainer'] },
    standardHeader: true,
    columns: ['studentId','subject','paper','score'],
    preForm: async function (record, mode) {
          console.log('preform routine',record);
         if (record.exam) {
         let ex = await db.getRow('examstaken', record.exam,);
          record.studentId = ex.studentId;
          record.subject = ex.subject;
        }
        return;
      },
     attributes: {
        exam: {
           model: 'examstaken',
           friendlyName: 'Exam taken',
           input: {type: 'hidden'},
         },
        studentId: {
            model: 'studentnorm',
            friendlyName: 'Student',
            input: {type: 'hidden'},
 
        },
        subject: {
            type: 'string',
            model: 'subjects',
            input: {type: 'hidden'},
        },
        paper: {
            type: 'string',
            model: 'papers',
            input: {
                type: 'select',
                search: {
                    andor: 'and',
                    searches: [
                         ['subject', 'equals', '$subject'],           // Refers top the global suds.poid that we set in the preForm routine
                    ],
                },
             },
        },


        score: {
            type: 'number',
            input: { type: 'number' ,max: 100},
         }

    }
}