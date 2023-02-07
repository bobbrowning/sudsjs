/**
 * Purchase order lines table schema
 *
  */

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
        let po = await db.getRow('purchaseorders', record.purchaseorder,);
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

  list: { columns: ['_id', 'product', 'product', 'units','total'], },
  standardHeader: true,
  attributes: {


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
            ['name', 'contains', '#input'],            // Refers to the input field - not a global
            ['supplier', 'equals', '$supplier'],           // Refers top the global suds.poid that we set in the preForm routine
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

}
