module.exports = {
    _id: {
        friendlyName: 'ID',
        primaryKey: true,
        permission: { view: ['admin'], edit: ['all'] },
    },
    createdAt: {
        friendlyName: 'Date created',
        type: 'number',
        display: { type: 'datetime', truncateForTableList: 16 },
        database: { type: 'biginteger' },
        input: { type: 'date' },
        process: { type: 'createdAt' },
        permission: { view: ['admin'] },
    },                                      // You don't actually enter these
    updatedAt: {                            // but if you did they would be dates. 
        friendlyName: 'Date last updated',    // so this also governs how they are diaplayed
        type: 'number',
        display: { type: 'datetime', truncateForTableList: 16 },
        database: { type: 'biginteger' },
        input: { type: 'date' },
        process: { type: 'updatedAt'},
        permission: { view: ['admin'] },   },
    updatedBy: {
        friendlyName: 'Last updated by',
        description: `The person who last updated the row.`,
        type: 'number',
        model: 'user',
        process: { type: 'updatedBy' },
        permission: { view: ['admin'] },
    },
}
