
/**
 *
 * Results table - normalised moned
 *
 */
let suds = require('../config/suds');
let db = require('../bin/suds/db');
module.exports = {
    description: 'Exam results',
    friendlyName: 'Exam results',
    permission: { all: ['admin', 'demo', 'trainer', 'demor'] },
    list: {
        columns: ['subject', 'studentId', 'paper', 'score'],
    },
    recordTypeColumn: 'subject',
    recordTypeInput: 'select',
    properties: {
        /* This inserts a standard header from fragments.js
            The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        studentId: {
            model: 'studentnorm',
            friendlyName: 'Student',
            input: { type: 'select', mandatory: true },
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
                        ['subject', 'equals', '$subject'], // Refers top the global that we set in the preForm routine
                    ],
                },
            },
        },
        score: {
            type: 'number',
            input: { type: 'number', max: 100, },
        },
    }
};
