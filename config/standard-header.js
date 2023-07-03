"use strict";
/**
 * standard record header
 *
 * If the following is added to the schemaa for a file the following fields are included
 * at the start of every record.
 *
 * standardheader: true,
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    /*** Change to id for SQL databases */
    couch: {
        _id: {
            friendlyName: 'Document ID',
            primaryKey: true,
            type: 'string',
            permission: { view: ['admin'], edit: ['all'] }, // edited by the system, but as most users can't see it they can't edit it manually
        },
        /*** remove rev and xcollection for databases other than CouchDB  */
        _rev: {
            friendlyName: 'Document revision',
            type: 'string',
            input: { type: 'hidden' },
            permission: { view: ['admin'], edit: ['all'] }, // edited by the system, but as most users can't see it they can't edit it manually
        },
        xcollection: {
            friendlyName: 'Collection',
            type: 'string',
            input: {
                default: '!table',
                type: 'hidden',
            },
        },
        /***  ************************* */
        createdAt: {
            friendlyName: 'Date created',
            type: 'number',
            display: { type: 'datetime', truncateForTableList: 16 },
            input: { type: 'date' },
            process: { type: 'createdAt' },
            permission: { view: ['none'] },
        },
        updatedAt: {
            friendlyName: 'Date last updated',
            type: 'number',
            display: { type: 'datetime', truncateForTableList: 16 },
            input: { type: 'date' },
            process: { type: 'updatedAt' },
            permission: { view: ['none'] },
        },
        updatedBy: {
            friendlyName: 'Last updated by',
            description: `The person who last updated the row.`,
            type: 'number',
            model: 'user',
            process: { type: 'updatedBy' },
            permission: { view: ['none'] },
        },
    },
    mongo: {
        _id: {
            friendlyName: 'Document ID',
            primaryKey: true,
            type: 'string',
            permission: { view: ['admin'], edit: ['all'] }, // edited by the system, but as most users can't see it they can't edit it manually
        },
        createdAt: {
            friendlyName: 'Date created',
            type: 'number',
            display: { type: 'datetime', truncateForTableList: 16 },
            input: { type: 'date' },
            process: { type: 'createdAt' },
            permission: { view: ['none'] },
        },
        updatedAt: {
            friendlyName: 'Date last updated',
            type: 'number',
            display: { type: 'datetime', truncateForTableList: 16 },
            input: { type: 'date' },
            process: { type: 'updatedAt' },
            permission: { view: ['none'] },
        },
        updatedBy: {
            friendlyName: 'Last updated by',
            description: `The person who last updated the row.`,
            type: 'number',
            model: 'user',
            process: { type: 'updatedBy' },
            permission: { view: ['none'] },
        },
    },
    sql: {
        id: {
            friendlyName: 'Document ID',
            primaryKey: true,
            type: 'number',
            autoincrement: true,
            permission: { view: ['admin'], edit: ['all'] }, // edited by the system, but as most users can't see it they can't edit it manually
        },
        /*** remove rev and xcollection for databases other than CouchDB  */
        createdAt: {
            friendlyName: 'Date created',
            type: 'number',
            database: { type: 'bigint' },
            display: { type: 'datetime', truncateForTableList: 16 },
            input: { type: 'date' },
            process: { type: 'createdAt' },
            permission: { view: ['none'] },
        },
        updatedAt: {
            friendlyName: 'Date last updated',
            database: { type: 'bigint' },
            type: 'number',
            display: { type: 'datetime', truncateForTableList: 16 },
            input: { type: 'date' },
            process: { type: 'updatedAt' },
            permission: { view: ['none'] },
        },
        updatedBy: {
            friendlyName: 'Last updated by',
            description: `The person who last updated the row.`,
            type: 'number',
            model: 'user',
            process: { type: 'updatedBy' },
            permission: { view: ['none'] },
        },
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhcmQtaGVhZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy9zdGFuZGFyZC1oZWFkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBOzs7Ozs7OztHQVFHOztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDYixzQ0FBc0M7SUFDdEMsS0FBSyxFQUFFO1FBQ0gsR0FBRyxFQUFFO1lBQ0QsWUFBWSxFQUFFLGFBQWE7WUFDM0IsVUFBVSxFQUFFLElBQUk7WUFDaEIsSUFBSSxFQUFFLFFBQVE7WUFDZCxVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLG1GQUFtRjtTQUN0STtRQUNELG9FQUFvRTtRQUNwRSxJQUFJLEVBQUU7WUFDRixZQUFZLEVBQUUsbUJBQW1CO1lBQ2pDLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtZQUN6QixVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLG1GQUFtRjtTQUN0STtRQUNELFdBQVcsRUFBRTtZQUNULFlBQVksRUFBRSxZQUFZO1lBQzFCLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFO2dCQUNILE9BQU8sRUFBRSxRQUFRO2dCQUNqQixJQUFJLEVBQUUsUUFBUTthQUNqQjtTQUNKO1FBQ0Qsa0NBQWtDO1FBQ2xDLFNBQVMsRUFBRTtZQUNQLFlBQVksRUFBRSxjQUFjO1lBQzVCLElBQUksRUFBRSxRQUFRO1lBQ2QsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxvQkFBb0IsRUFBRSxFQUFFLEVBQUU7WUFDdkQsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRTtZQUN2QixPQUFPLEVBQUUsRUFB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