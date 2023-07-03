
/**
 *
 * Student table - normalised moned
 *
 */
module.exports = {
    description: 'Student - normalised model',
    friendlyName: 'Student',
    stringify: 'name',
    permission: { all: ['admin', 'demo', 'trainer', 'demor'] },
    list: {
        columns: ['name', 'address1', 'address2', 'city', 'zip', 'results'],
        open: 'results',
    },
    properties: {
        /* This inserts a standard header from fragments.js
          The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        name: {
            type: 'string'
        },
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
    children: {
        results: {
            collection: 'results',
            via: 'studentId',
            friendlyName: 'Results',
            collectionList: {
                limit: 999,
                order: '_id',
                direction: 'DESC',
                addRow: 'Add a new result',
                columns: ['subject', 'paper', 'score'],
            },
        },
    }
};
