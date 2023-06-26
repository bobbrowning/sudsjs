"use strict";
/**
 * Product / Spares Join Table.js
 *
  */
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    description: `Product / Spare parts join table. There is a many-to-many relationship between 
 products and spare parts.  A spare can be used in many products and a product 
 can have many spare parts. 
 This table enables this by linking the two files. 
 There is one record for each time a spare part id used in a product.`,
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
        product: {
            model: 'products',
        },
        spare: {
            model: 'spares',
        },
    },
};
