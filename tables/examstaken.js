/**
 * 
 * Student table - normalised moned
 * 
 */
 let suds = require('../config/suds');
let db = require('../bin/suds/db');
module.exports = {
    description: 'Exam results',

    friendlyName: 'Exams taken',
    permission: { all: ['admin', 'demo', 'trainer'] },
    standardHeader: true,
    list: {
    columns: ['studentId', 'subject',],
    },
    stringify: async function(record) {
        let ex = await db.getRow('subjects', record.subject,);
          return (ex.name);
    },
    attributes: {
        studentId: {
            model: 'studentnorm',
            friendlyName: 'Student',
            input: {
                type: 'autocomplete',
                search: 'name',
                required: true,
                placeholder: 'Start typing Student name',
            },
        },
        subject: {
            type: 'string',
            model: 'subjects',
            input: { type: 'select', },
        },
        results: {
            collection: 'results',
            via: 'exam',
            friendlyName: 'Results',          //Heading to the listing 
            collectionList: {                                            // Contact notes are listed below the person's record
              limit: 999,                           // number of child records listed in the detail page
              order: '_id',                 // The order in which the are listed 
              direction: 'DESC',                  // ASC or DESC
              addRow: 'Add a new result',
              columns: ['paper','score'],
            },
             
        },

    }
}