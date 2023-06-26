"use strict";
/**
 * Spares.js
 *
  */
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    description: 'Spare parts',
    properties: {
        id: {
            friendlyName: 'User No',
            type: 'number',
            primaryKey: true,
            autoincrement: true,
        },
        createdAt: {
            friendlyName: 'Date created',
            type: 'number',
            display: { type: 'datetime', truncateForTableList: 16 },
            database: { type: 'bigint' },
            process: { createdAt: true }
        },
        updatedAt: {
            friendlyName: 'Date last updated',
            type: 'number',
            display: { type: 'datetime', truncateForTableList: 16 },
            database: { type: 'bigint' },
            process: { updatedAt: true }
        },
        updatedBy: {
            friendlyName: 'Last updated by',
            description: `The person who last updated the row.`,
            type: 'number',
            model: 'user',
            process: { updatedBy: true }
        },
        name: {
            type: 'string',
            input: { required: true, },
            description: 'Part name',
        },
        supplier: {
            model: 'user',
        },
        price: {
            type: 'number',
            input: { required: true, },
            description: 'Unit price',
        },
        vatable: {
            type: 'boolean',
            description: 'Whether subject to VAT',
        },
    },
};
