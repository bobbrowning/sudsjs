/**
 * 
 * Student table - normalised moned
 * 
 */
module.exports = {
    description: 'Student - normalised model',

    friendlyName: 'Student',
    stringify: 'name',
    permission: { all: ['admin', 'demo','trainer'] },
    standardHeader: true,
    attributes: {
        name: {
            type: 'string'
        },
        address: {
            type: 'object',
            object: {
                address1: {
                    type: 'string'
                },
                address2: {
                    type: 'string'
                },
                city: {
                    type: 'string'
                },
                zip: {
                    type: 'string'
                },
            },
        },
        results: {
            array: { type: 'multiple' },
            type: 'object',
            stringify: function (data) {
                return (`${data.subject} - ${data.score}`)
            },
            object: {
                Subject: {
                    type: 'string',
                     model: 'subjects',
                    input: {
                        type: 'select',
                    },
                },
                score: {
                    type: 'string',
                    input: { type: 'select' },
                    values: {
                        A: 'Top',
                        B: 'Pass',
                        F: 'Fail',

                    }
                }
            }

        }
    }
}