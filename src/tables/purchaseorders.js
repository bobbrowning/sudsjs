
/**
 *
 * Purchase orders table schema
 */

const stock = require('../bin/custom/stock');
module.exports = {
    description: 'Purchase orders',
    friendlyName: 'Purchase Orders',
    permission: { all: ['admin', 'purchasing', 'demo'], view: ['sales'] },
    addRow: 'Add new purchase order',
    list: {
        columns: ['_id', 'supplier', 'date', 'status'],
    },
    open: 'purchaseorderlines',
    properties: {
        /* This inserts a standard header from fragments.js
            The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        supplier: {
            description: 'Supplier ID',
            model: 'user',
            input: {
                type: 'autocomplete',
                required: true,
                search: {
                    andor: 'and',
                    searches: [
                        ['fullName', 'contains', '#input'],
                        ['userType', 'equals', 'S'],
                    ],
                },
                placeholder: 'Number or type name (case sensitive)',
                idPrefix: 'Supplier: ',
            },
            display: {
                openGroup: 'products',
                open: 'purchaseorders',
            },
        },
        date: {
            type: 'string',
            description: 'Date (ISO Format) of order',
            example: '2020-10-29 13:59:58.000',
            input: {
                type: 'date',
                required: true,
                default: '#today',
            },
        },
        notes: {
            description: 'Notes about the order',
            type: 'string',
            input: { type: 'textarea', rows: '5', cols: '40' },
            display: { maxWidth: '400px' },
        },
        status: {
            description: 'Status of the order',
            type: 'string',
            values: {
                A: 'Order placed',
                B: 'Being processed',
                C: 'Dispatched',
                D: 'Confirmed recieved',
            },
            input: {
                type: 'radio',
            }
        },
    },
    children: {
        purchaseorderlines: {
            collection: 'purchaseorderlines',
            via: 'purchaseorder',
            friendlyName: 'Purchase Order lines',
            collectionList: {
                limit: 999,
                order: '_id',
                direction: 'DESC',
                addRow: 'Add a new order line',
                columns: ['product', 'units', 'unitprice', 'total'],
            },
        },
    }
};
