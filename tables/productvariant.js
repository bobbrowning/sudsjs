"use strict";
/**
 * Product variant table schema
 *
  */
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    friendlyName: 'Main product to Sub product link',
    description: 'Used to link products, such as product/spares or product/accessories.',
    permission: { all: ['admin', 'purchasing', 'demo'], view: ['sales'] },
    stringify: function (record) {
        let suds = require('../config/suds');
        let formatter = new Intl.NumberFormat(suds.currency.locale, {
            style: 'currency',
            currency: suds.currency.currency,
            minimumFractionDigits: suds.currency.digits,
        });
        price = formatter.format(record.price);
        return `${record.name} Guide retail price: ${price}`;
    },
    properties: {
        /* This inserts a standard header from fragments.js
            The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        product: {
            model: 'products',
            input: {
                type: 'autocomplete',
                limit: 5,
                search: {
                    andor: 'and',
                    searches: [
                        ['name', 'contains', '#input'],
                    ],
                },
                width: '80%',
                minLength: 2,
                placeholder: 'Number or type name (case sensitive)',
                idPrefix: 'Product number: ',
            },
            display: {
                linkedTable: 'product',
                makeLink: true, // hypertext link to the linked table
            },
        },
        name: { type: 'string' },
        price: {
            type: 'number',
            friendlyName: 'Guide retail unit price',
            input: {
                width: '150px',
                step: .01,
                required: true,
            },
            display: { currency: true },
        },
        note: { type: 'string' },
    },
};
