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
    /** Standard date  */
    /**
     * Standard headers for different databases
     */
    couchHeader: {
        _id: {
            friendlyName: 'Document ID',
            primaryKey: true,
            type: 'string',
            permission: { view: ['admin'], edit: ['all'] }, // edited by the system, but as most users can't see it they can't edit it manually
        },
        _rev: {
            friendlyName: 'Document revision',
            type: 'string',
            input: { type: 'hidden' },
            permission: { view: ['admin'], edit: ['all'] }, // edited by the system, but as most users can't see it they can't edit it manually
        },
        collection: {
            friendlyName: 'Collection',
            type: 'string',
            input: {
                default: '!table',
                type: 'hidden',
            },
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
    mongoHeader: {
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
    sqliteHeader: {
        id: {
            friendlyName: 'Document ID',
            primaryKey: true,
            type: 'number',
            autoincrement: true,
            permission: { view: ['admin'], edit: ['all'] }, // edited by the system, but as most users can't see it they can't edit it manually
        },
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
    mysqlHeader: {
        id: {
            friendlyName: 'Document ID',
            primaryKey: true,
            type: 'number',
            autoincrement: true,
            permission: { view: ['admin'], edit: ['all'] }, // edited by the system, but as most users can't see it they can't edit it manually
        },
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
    postgresqlHeader: {
        id: {
            friendlyName: 'Document ID',
            primaryKey: true,
            type: 'number',
            autoincrement: true,
            permission: { view: ['admin'], edit: ['all'] }, // edited by the system, but as most users can't see it they can't edit it manually
        },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhZ21lbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RhYmxlcy9mcmFnbWVudHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBOzs7Ozs7OztHQVFHOztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDYixxQkFBcUI7SUFDckI7O09BRUc7SUFDSCxXQUFXLEVBQUU7UUFDVCxHQUFHLEVBQUU7WUFDRCxZQUFZLEVBQUUsYUFBYTtZQUMzQixVQUFVLEVBQUUsSUFBSTtZQUNoQixJQUFJLEVBQUUsUUFBUTtZQUNkLFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsbUZBQW1GO1NBQ3RJO1FBQ0QsSUFBSSxFQUFFO1lBQ0YsWUFBWSxFQUFFLG1CQUFtQjtZQUNqQyxJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDekIsVUFBVSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxtRkFBbUY7U0FDdEk7UUFDRCxVQUFVLEVBQUU7WUFDUixZQUFZLEVBQUUsWUFBWTtZQUMxQixJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRTtnQkFDSCxPQUFPLEVBQUUsUUFBUTtnQkFDakIsSUFBSSxFQUFFLFFBQVE7YUFDakI7WUFDRCxVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLG1GQUFtRjtTQUN0STtRQUNELFNBQVMsRUFBRTtZQUNQLFlBQVksRUFBRSxjQUFjO1lBQzVCLElBQUksRUFBRSxRQUFRO1lBQ2QsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxvQkFBb0IsRUFBRSxFQUFF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