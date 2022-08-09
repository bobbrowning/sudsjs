/**
 * 
 * Student table - normalised moned
 * 
 */
let db = require('../bin/suds/db-mongo');
module.exports = {
    description: 'Exam results',

    friendlyName: 'Exam results',
    permission: { all: ['admin', 'demo', 'trainer', 'demor'] },
    standardHeader: true,
    columns: ['studentId', 'subject', 'paper', 'score'],
    recordTypeColumn: 'subject',
    recordTypeInput: 'select',
    attributes: {
        studentId: {
            model: 'studentnorm',
            friendlyName: 'Student',
            input: { type: 'hidden' },

        },
        subject: {
            type: 'string',
            model: 'subjects',

            input: {
                type: 'readonly',
            },
        },
        paper: {
            type: 'string',
            model: 'papers',
            input: {
                type: 'select',
                search: {
                    andor: 'and',
                    searches: [
                        ['subject', 'equals', '$subject'],           // Refers top the global that we set in the preForm routine
                    ],
                },
            },
        },


        score: {
            type: 'number',
            input: { type: 'number', max: 100, },
        }

    }
}