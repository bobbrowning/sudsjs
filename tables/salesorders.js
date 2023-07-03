"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FsZXNvcmRlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGFibGVzL3NhbGVzb3JkZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0E7Ozs7O0dBS0c7QUFDSCxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNyQyxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNuQyxNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2IsWUFBWSxFQUFFLGNBQWM7SUFDNUIsV0FBVyxFQUFFLGlCQUFpQjtJQUM5QixVQUFVLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFO0lBQ3JFLFNBQVMsRUFBRSxVQUFVLE1BQU07UUFDdkIsT0FBTyxTQUFTLE1BQU0sQ0FBQyxJQUFJLFlBQVksTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQy9ELENBQUM7SUFDRCxJQUFJLEVBQUU7UUFDRixPQUFPLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsWUFBWSxDQUFDO1FBQ2xFLElBQUksRUFBRSxpQkFBaUI7S0FDMUI7SUFDRCxJQUFJLEVBQUU7UUFDRixVQUFVLEVBQUUsS0FBSyxXQUFXLE1BQU0sRUFBRSxTQUFTO1lBQ3pDLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3ZCLEdBQUcsRUFBRSxNQUFNLENBQUMsUUFBUTtnQkFDcEIsUUFBUSxFQUFFLEdBQUc7Z0JBQ2IsUUFBUSxFQUFFLE1BQU0sQ0FBQyxHQUFHO2FBQ3ZCLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1lBQ3RCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMs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