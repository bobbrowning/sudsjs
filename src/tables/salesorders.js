
/**
 * Sales Orders table schema
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
let suds = require('../config/suds');
let db = require('../bin/suds/db');
module.exports = {
    friendlyName: 'Sales orders',
    description: 'Customer orders',
    permission: { all: ['sales', 'admin', 'demo'], view: ['purchasing'] },
    stringify: function (record) {
        return `Date: ${record.date} Value: £${record.totalValue}`;
    },
    list: {
        columns: ['updatedAt', 'customer', 'status', 'date', 'orderlines'],
        open: 'salesorderlines',
    },
    edit: {
        preProcess: async function (record, operation) {
            await db.updateRow('user', {
                _id: record.customer,
                userType: 'C',
                lastSale: record._id,
            });
            record.totalValue = 0;
            for (let i = 0; i < record.orderlines.length; i++) {
                console.log(record.orderlines[i].price);
                record.totalValue += Number(record.orderlines[i].price) * Number(record.orderlines[i].units);
            }
            console.log(record);
            return;
        }
    },
    properties: {
        /* This inserts a standard header from fragments.js
            The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        customer: {
            description: 'Customer',
            model: 'user',
            input: {
                type: 'autocomplete',
                search: 'fullName',
                required: true,
            },
            display: {
                openGroup: 'sales',
                open: 'salesorders',
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
            friendlyName: 'Sale date',
        },
        notes: {
            description: 'Notes about the order, special delivery instructions etc',
            type: 'string',
            input: { type: 'textarea', rows: '5' },
        },
        status: {
            description: 'Status of the order',
            type: 'string',
            values: {
                O: 'Ordered',
                P: 'Processing',
                D: 'Dispatched',
            },
            input: {
                type: 'select',
            }
        },
        orderlines: {
            array: { type: 'multiple' },
            friendlyName: 'Products in the order',
            type: 'object',
            stringify: async function (data) {
                let record = await db.getRow('products', data.product);
                shortname = "Record not found";
                if (record.name) {
                    shortname = record.name.substr(0, 40);
                }
                return `${data.units} X ${shortname}`;
            },
            properties: {
                product: {
                    description: 'Product',
                    model: 'products',
                    input: {
                        type: 'autocomplete',
                        required: true,
                        search: {
                            andor: 'and',
                            searches: [
                                ['name', 'contains', '#input'],
                            ],
                        },
                        placeholder: 'Number or type name (case sensitive)',
                        idPrefix: 'Product number: ',
                    },
                    display: {
                        linkedTable: 'products',
                        makeLink: true, // hypertext link to the linked table
                    },
                },
                units: {
                    type: 'number',
                    //     required: true,
                    description: 'Number of units ordered',
                    friendlyName: 'Number of units',
                    input: {
                        type: 'number',
                        step: 1,
                        max: 100,
                    },
                },
                price: {
                    friendlyName: 'Unit price',
                    type: 'number',
                    input: { step: .01, },
                    display: { currency: true },
                },
            },
        },
        totalValue: {
            type: 'number',
            input: { type: 'hidden' },
            display: { currency: true },
            friendlyName: 'Total order value',
        },
    },
};
