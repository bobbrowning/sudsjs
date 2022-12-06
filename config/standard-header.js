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
    
     /*** Change to id for SQL databases */
    _id: {
        friendlyName: 'Document ID',
        primaryKey: true,
        type: 'string',
        permission: { view: ['admin'], edit: ['all'] },  // edited by the system, but as most users can't see it they can't edit it manually
    },
 
    /*** remove rev and xcollection for databases other than CouchDB  */
  _rev: {
        friendlyName: 'Document revision',
        type: 'string',
        input: {type: 'hidden'}, 
        permission: { view: ['admin'], edit: ['all'] },  // edited by the system, but as most users can't see it they can't edit it manually
    },
    xcollection: {
        friendlyName: 'Collection',
        type: 'string',
        input: {
            default: '!table',
            type: 'hidden',
        },
        permission: { view: ['admin'], edit: ['all'] },  // edited by the system, but as most users can't see it they can't edit it manually
    },
     /***  ************************* */


    createdAt: {
        friendlyName: 'Date created',
        type: 'number',
        display: { type: 'datetime', truncateForTableList: 16 },
        input: { type: 'date' },            // input by the system not the user.
        process: { type: 'createdAt' },     
        permission: { view: ['none'] },
    },                                     
    updatedAt: {                             
        friendlyName: 'Date last updated',    
        type: 'number',
        display: { type: 'datetime', truncateForTableList: 16 },
        input: { type: 'date' },
        process: { type: 'updatedAt'},
        permission: { view: ['none'] },   },
    updatedBy: {
        friendlyName: 'Last updated by',
        description: `The person who last updated the row.`,
        type: 'number',
        model: 'user',
        process: { type: 'updatedBy' },
        permission: { view: ['none'] },
    },
}
