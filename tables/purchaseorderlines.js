"use strict";
/**
 * Purchase order lines table schema
 *
  */
Object.defineProperty(exports, "__esModule", { value: true });
let suds = require('../config/suds');
let db = require('../bin/suds/db');
let stock = require('../bin/custom/stock');
const { appendFile } = require('fs');
module.exports = {
    description: 'Purchase Order lines',
    friendlyName: 'Purchase Order Lines',
    permission: { all: ['purchasing', 'admin', 'demo'], view: ['sales'] },
    edit: {
        /* This routine stores the supplier id in a global by reading the purchase order */
        /*  The global is used later in the autocomplete  spec.                          */
        preForm: async function (record, mode) {
            if (record.purchaseorder) {
                console.log(record);
                let po = await db.getRow('purchaseorders', record.purchaseorder);
                record.supplier = po.supplier;
            }
            return;
        },
        /*  After the form is submitted, this routine works out the total cost.        */
        preProcess: async function (record) {
            record.total = record.units * record.unitprice;
            await stock('purchaseorderlines', record);
            return;
        },
        /*  After the database has been updated, update the purchase order with the     */
        /*  total of the order lines                                                    */
    },
    list: { columns: ['_id', 'product', 'product', 'units', 'total'], },
    properties: {
        /* This inserts a standard header from fragments.js
            The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        purchaseorder: {
            description: 'Order',
            model: 'purchaseorders',
            friendlyName: 'Purchase order number',
            input: {
                placeholder: 'To avoid errors we strongly recommend going via the PO page.',
                required: true,
            },
        },
        product: {
            description: 'Product',
            model: 'products',
            input: {
                type: 'autocomplete',
                required: true,
                //        onchange: 'fillVariant()',
                search: {
                    andor: 'and',
                    searches: [
                        ['name', 'contains', '#input'],
                        ['supplier', 'equals', '$supplier'], // Refers top the global suds.poid that we set in the preForm routine
                    ],
                },
                placeholder: 'Number or type name (case sensitive)',
                idPrefix: 'Product number: ',
            },
        },
        variant: {
            type: 'string',
            input: {
                type: 'select',
                onevents: {
                    onload: `fillChildSelect('{{fieldName}}','get-variants','autoid_product','{{fieldValue}}')`,
                    onfocus: `fillChildSelect('{{fieldName}}','get-variants','autoid_product')`,
                },
                /*       onchange: 'fillSubVariant()',
                       after: `
                       <script defer>
                           variant_id="{{fieldValue}}";
                           fillVariant(variant_id);
                       </script>`,*/
            },
        },
        subVariant: {
            type: 'string',
            input: {
                type: 'select',
                /*       after: `
                       <script defer>
                          subvariant_id="{{fieldValue}}";
                          fillSubVariant(variant_id,subvariant_id)
                       </script>`,*/
                onevents: {
                    onload: `fillChildSelect('{{fieldName}}','get-subvariants',['autoid_product','variant'],'{{fieldValue}}')`,
                    onfocus: `fillChildSelect('{{fieldName}}','get-subvariants',['autoid_product','variant'])`,
                },
            },
        },
        units: {
            type: 'number',
            description: 'Number of units ordered',
            friendlyName: 'Number of units',
            input: {
                isInteger: true,
                width: '100px', required: true,
            },
        },
        unitprice: {
            friendlyName: 'Unit price',
            type: 'number',
            input: { step: .01, },
            display: { currency: true },
        },
        supplier: {
            type: 'number',
            model: 'user',
            input: { type: 'hidden' },
        },
        total: {
            type: 'number',
            input: { type: 'hidden' },
            display: { currency: true },
        }
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVyY2hhc2VvcmRlcmxpbmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RhYmxlcy9wdXJjaGFzZW9yZGVybGluZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBOzs7SUFHSTs7QUFFSixJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNyQyxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNuQyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUMzQyxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JDLE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDYixXQUFXLEVBQUUsc0JBQXNCO0lBQ25DLFlBQVksRUFBRSxzQkFBc0I7SUFDcEMsVUFBVSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRTtJQUNyRSxJQUFJLEVBQUU7UUFDRixtRkFBbUY7UUFDbkYsbUZBQW1GO1FBQ25GLE9BQU8sRUFBRSxLQUFLLFdBQVcsTUFBTSxFQUFFLElBQUk7WUFDakMsSUFBSSxNQUFNLENBQUMsYUFBYSxFQUFFO2dCQUN0QixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNwQixJQUFJLEVBQUUsR0FBRyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUNqRSxNQUFNLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUM7YUFDakM7WUFDRCxPQUFPO1FBQ1gsQ0FBQztRQUNELGlGQUFpRjtRQUNqRixVQUFVLEVBQUUsS0FBSyxXQUFXLE1BQU07WUFDOUIsTUFBTSxDQUFDLEtBQUssR0FBRyxN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