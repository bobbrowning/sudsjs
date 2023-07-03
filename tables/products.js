"use strict";
/**
 * Products table schema
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    friendlyName: 'Products',
    description: `One record for each product that the organisation deals in.`,
    /**
     * The stringify function creates a human-friendly descriotion of the record
     * It returns the name of the product blus a list of prices from the variants array
     * Example: "E-Bike Battery (Guide retail price(s): £85.00 / £180.00)"
     *
     * @param {object} record
     * @returns {string} Description of record
     */
    stringify: function (record) {
        let suds = require('../config/suds');
        let formatter = new Intl.NumberFormat(suds.currency.locale, {
            style: 'currency',
            currency: suds.currency.currency,
            minimumFractionDigits: suds.currency.digits,
        });
        let price = '';
        if (record.variants && record.variants.length) {
            for (let i = 0; i < record.variants.length; i++) {
                if (i > 0) {
                    price += ' / ';
                }
                price += formatter.format(record.variants[i].salesPrice);
            }
        }
        else {
            price = 'Price TBD';
        }
        return `${record.name} (Guide retail price(s): ${price})`;
    },
    /**
     *
     * This feature allows for different data fields for different types of product.  The subschema
     * field has a subschema type field so that youcan have different subschemas for different applications
     * There is one for exam results as well.
     */
    subschema: {
        key: 'productGroup',
    },
    list: {
        columns: ['name', 'supplier', 'productGroup'],
    },
    permission: { all: ['admin', 'purchasing', 'demo'], view: ['sales'] },
    /**
     * The input and display screens are divided into groups. Any field not included in any group
     * are put in the 'other' group.
     */
    groups: {
        basic: {
            static: true,
            columns: ['_id', 'name', 'supplier'],
        },
        activityLog: {
            friendlyName: 'Activity Log',
            activityLog: true,
            limit: 10,
            activities: ['salesorders', 'purchaseorderlines'],
            permission: { view: ['sales', 'purchasing', 'admin', 'demo'] },
        },
        details: {
            friendlyName: 'Details',
            columns: ['overview', 'image', 'vatable'],
        },
        variants: {
            friendlyName: 'Variants',
            columns: ['variants']
        },
        transactions: {
            friendlyName: 'Transactions',
            columns: ['purchases', 'sales'],
            open: 'sales',
        },
        related: {
            friendlyName: 'Related Products',
            columns: ['associatedProducts'],
        },
        description: {
            friendlyName: 'Full description',
            columns: ['description'],
        },
        productGroup: {
            friendlyName: 'Product group',
            columns: ['productGroup'],
        },
    },
    properties: {
        /* This inserts a standard header from fragments.js
           The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        name: {
            type: 'string',
            description: 'Product name',
            input: {
                placeholder: 'Enter the name of the product',
                required: true,
            },
        },
        productGroup: {
            type: 'string',
            array: { type: 'single' },
            friendlyName: 'Product Groups',
            description: 'Check those that apply',
            model: 'subschema',
            input: {
                type: 'checkboxes',
                search: {
                    searches: [
                        ['group', 'eq', 'productSpecifications'],
                    ]
                }
            },
        },
        supplier: {
            model: 'user',
            input: {
                type: 'select',
                search: {
                    searches: [
                        ['userType', 'equals', 'S']
                    ]
                }
            }
        },
        vatable: {
            type: 'boolean',
            description: 'Whether subject to VAT',
        },
        overview: {
            type: 'string',
            database: { type: 'varchar', length: 2000 },
            input: {
                type: 'textarea',
                rows: 4,
                placeholder: 'Enter a brief description of the product',
            },
        },
        image: {
            type: 'string',
            input: { type: 'uploadFile' },
        },
        description: {
            type: 'string',
            database: { type: 'varchar', length: 2000 },
            input: {
                format: 'col',
                type: 'ckeditor4',
                height: 300,
                placeholder: 'Please enter product description'
            },
            display: { truncateForTableList: 50 },
        },
        /**
         * The associated products list is structured as follows:
         *    associatedProducts
         *           -product key
         *           -relationship to product
         *
         */
        associatedProducts: {
            type: 'object',
            array: { type: 'multiple', bite: 2 },
            properties: {
                product: {
                    friendlyName: 'associated products',
                    model: 'products',
                    input: {
                        type: 'autocomplete',
                        search: 'name',
                    },
                },
                APType: {
                    friendlyName: 'Relationship to product',
                    type: 'string',
                    input: { type: 'checkboxes' },
                    array: { type: 'single' },
                    values: {
                        S: 'spare part of this product',
                        A: 'Often purchased together',
                    }
                }
            },
        },
        /** The variants list is structured as follows:
         *
         * variants list
         *    - friendly name
         *    - Stock Keeping Unit (product code)
         *    - Sales price
         *    - cost price
         *    - Subvariants list for that variant (Colours)
         *         - friendly Name
         *    -    - SKU
        */
        variants: {
            type: 'object',
            friendlyName: 'Variant',
            array: { type: 'multiple', bite: 5 },
            properties: {
                friendlyName: { type: 'string' },
                SKU: {
                    type: 'string',
                    description: `Only include SKU if there are no subvariants`
                },
                description: {
                    type: 'string',
                    input: { type: 'textarea' },
                },
                salesPrice: {
                    type: 'number',
                    friendlyName: 'Guide retail unit price',
                    input: {
                        width: '150px',
                        step: .01,
                    },
                    display: { currency: true },
                },
                costPrice: {
                    type: 'number',
                    friendlyName: 'Cost price',
                    input: {
                        width: '150px',
                        step: .01,
                    },
                    display: { currency: true },
                },
                subvariants: {
                    type: 'object',
                    friendlyName: 'Colour',
                    stringify: 'friendlyName',
                    array: { type: 'multiple', bite: 5 },
                    properties: {
                        friendlyName: { type: 'string' },
                        SKU: {
                            type: 'string',
                        },
                    }
                }
            },
        },
    },
    children: {
        /**
         *
         * These are not real fields in the database, but reflect the child records we list.
         * Purchase orders are normalised and sales orders are denormalised but this has very
         * little effect on these entries.#
         *
         */
        purchases: {
            collection: 'purchaseorderlines',
            via: 'product',
            addRow: false,
            collectionList: {
                columns: ['product', 'variant', 'subVariant', 'units'],
            }
        },
        sales: {
            collection: 'salesorders',
            via: 'orderlines.product',
            addRow: false,
            collectionList: {
                columns: ['updatedAt', '_id', 'customer', 'status', 'date'],
            },
        },
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZHVjdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGFibGVzL3Byb2R1Y3RzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQTs7O0dBR0c7O0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRztJQUNiLFlBQVksRUFBRSxVQUFVO0lBQ3hCLFdBQVcsRUFBRSw2REFBNkQ7SUFDMUU7Ozs7Ozs7T0FPRztJQUNILFNBQVMsRUFBRSxVQUFVLE1BQU07UUFDdkIsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDckMsSUFBSSxTQUFTLEdBQUcsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO1lBQ3hELEtBQUssRUFBRSxVQUFVO1lBQ2pCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVE7WUFDaEMscUJBQXFCLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNO1NBQzlDLENBQUMsQ0FBQztRQUNILElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNmLElBQUksTUFBTSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtZQUMzQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzdDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDUCxLQUFLLElBQUksS0FBSyxDQUFDO2lCQUNsQjtnQkFDRCxLQUFLLElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQzVEO1NBQ0o7YUFDSTtZQUNELEtBQUssR0FBRyxXQUFXLENBQUM7U0FDdkI7UUFDRCxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksNEJBQTRCLEtB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