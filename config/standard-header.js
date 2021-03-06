/**
 * standard record header
 * 
 * If the following is added to the schemaa for a file the following fields are included 
 * at the start of every record. 
 * 
 * standardheader: true,
 * 
 */

module.exports = {
    _id: {
        friendlyName: 'Document ID',
        primaryKey: true,
        permission: { view: ['admin'], edit: ['all'] },  // edited by the system, but as most users can't see it they can't edit it manually
    },
    createdAt: {
        friendlyName: 'Date created',
        type: 'number',
        display: { type: 'datetime', truncateForTableList: 16 },
        input: { type: 'date' },            // input by the system not the user.
        process: { type: 'createdAt' },     
        permission: { view: ['admin'] },
    },                                     
    updatedAt: {                             
        friendlyName: 'Date last updated',    
        type: 'number',
        display: { type: 'datetime', truncateForTableList: 16 },
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
