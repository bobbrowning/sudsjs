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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FsZXNvcmRlcmxpbmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RhYmxlcy9zYWxlc29yZGVybGluZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBOzs7SUFHSTs7QUFFSixJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNyQyxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNuQyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUMzQyxNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2IsV0FBVyxFQUFFLGFBQWE7SUFDMUIsWUFBWSxFQUFFLG1CQUFtQjtJQUNqQyxVQUFVLEVBQUU7UUFDUixHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQztRQUMvQixJQUFJLEVBQUUsQ0FBQyxZQUFZLENBQUM7S0FDdkI7SUFDRCxJQUFJLEVBQUU7UUFDRixPQUFPLEVBQUUsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQztLQUN6RTtJQUNELFNBQVMsRUFBRSxLQUFLLFdBQVcsTUFBTTtRQUM3QixJQUFJLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxRCxJQUFJLFFBQVEsR0FBRyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN4RCxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssTUFBTSxPQUFPLENBQUMsSUFBSSxRQUFRLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUN4RSxDQUFDO0lBQ0QsNkVBQTZFO0lBQzdFLCtCQUErQjtJQUMvQixJQUFJLEVBQUU7UUFDRiw2RkFBNkY7UUFDN0Ys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