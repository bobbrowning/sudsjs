"use strict";
/**
 * Product Joins table schema
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    friendlyName: 'Main product to Sub product link',
    description: 'Used to link products, such as product/spares or product/accessories.',
    permission: { all: ['admin', 'purchasing', 'demo'], view: ['sales'] },
    properties: {
        /* This inserts a standard header from fragments.js
           The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        mainproduct: {
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
        subproduct: {
            model: 'products',
            child: false,
            input: {
                type: 'autocomplete',
                limit: 5,
                search: {
                    andor: 'or',
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
        type: {
            input: { type: 'radio' },
            values: {
                C: 'Component / spare part',
                A: 'Accessory',
            }
        }
    },
};
