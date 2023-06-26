"use strict";
/**
 * Sales order lines table schema
 *
  */
Object.defineProperty(exports, "__esModule", { value: true });
let suds = require('../config/suds');
let db = require('../bin/suds/db');
let stock = require('../bin/custom/stock');
module.exports = {
    description: 'Order lines',
    friendlyName: 'Sales Order Lines',
    permission: {
        all: ['sales', 'admin', 'demo'],
        view: ['purchasing'],
    },
    list: {
        columns: ['_id', 'orderNo', 'customer', 'product', 'variant', 'total'],
    },
    stringify: async function (record) {
        let product = await db.getRow('products', record.product);
        let customer = await db.getRow('user', record.customer);
        return `${record.units} X ${product.name} for ${customer.fullName}`;
    },
    /**  This allows you to vary the input form depending on the record type.  */
    // recordTypeColumn: 'product',
    edit: {
        /** This function reads the sales order data and fills out the customer number in the form */
        preForm: async function (record, mode) {
            if (record.orderNo) {
                let so = await db.getRow('salesorders', record.orderNo);
                record.customer = so.customer;
            }
            return;
        },
        /** Before saving the row - extend units x price to give order line value */
        preProcess: function (record) {
            record.total = record.units * record.price;
            stock('salesorderlines', record);
            return;
        },
        /** Add up the 'total' field in each sales order line in thie order and update the parent sales order */
        postProcess: async function (record, operation) {
            let total = await db.totalRows('salesorderlines', { searches: [['orderNo', 'eq', record.orderNo]] }, 'total');
            await db.updateRow('salesorders', { _id: record.orderNo, totalValue: total });
            return;
        },
    },
    properties: {
        /* This inserts a standard header from fragments.js
            The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        orderNo: {
            description: 'Order',
            model: 'salesorders',
            input: {
                required: true,
                placeholder: 'To avoid errors we strongly recommend going via the sales order page.',
            },
            friendlyName: 'Order number',
        },
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
        total: {
            type: 'number',
            input: { hidden: true },
            display: { currency: true },
        },
        customer: {
            model: 'user',
            type: 'number',
            input: { type: 'hidden' }
        }
    },
};
