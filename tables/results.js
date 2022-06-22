/**
 * 
 * Student table - normalised moned
 * 
 */
module.exports = {
    description: 'Exam results',

    friendlyName: 'Exam results',

    permission: { all: ['admin', 'demo', 'trainer'] },
    standardHeader: true,
    attributes: {

        studentId: {
            model: 'studentnorm',
            input: {
                type: 'autocomplete',
                search: 'name',
                required: true,
                placeholder: 'Start typing Student name',
            },
        },
        Subject: {
            type: 'string',
            input: { type: 'textarea' },
            model: 'subjects',
            input: {
                type: 'autocomplete',
                search: 'name',
                required: true,
                placeholder: 'Start typing Subject',
            },
        },
        score: {
            type: 'string',
            input: {type: 'select'},
            values: {
                A:'Top',
                B:'Pass',
                F:'Fail',

            }
        }

    }
}