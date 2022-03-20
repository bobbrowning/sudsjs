/**
 * Purchase order lines table schema
 *
  */

 let db = require('../bin/suds/db');
  let stock=require('../bin/custom/stock');
module.exports = {
  description: 'Purchase Order lines',

  friendlyName: 'Purchase Order Lines',
  
  permission: { all: ['purchasing', 'admin','demo'], view: ['sales'] },

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
      await stock('purchaseorderlines',record);
      return;
    },

    /*  After the database has been updated, update the purchase order with the     */
    /*  total of the order lines                                                    */
    postProcess: async function (record, operation) {
      let total = await db.totalRows(
        'purchaseorderlines',
        { searches: [['purchaseorder', 'eq', record.purchaseorder]] },
        'total',
      );
      await db.updateRow('purchaseorders', { _id: record.purchaseorder, total: total });
      return;
    },
  },

  list: { columns: ['_id', 'product', 'product', 'units'], },

  attributes: {
    _id: {
      friendlyName: 'Line No',                            // Visible name 
      type: 'object',
      primaryKey: true,
      autoincrement: true,
    },
    createdAt: {
      friendlyName: 'Date created',
      type: 'number',
      display: { type: 'datetime', truncateForTableList: 16 },
      database: { type: 'biginteger' },
      process: { createdAt: true }
    },                                      // You don't actually enter these
    updatedAt: {                            // but if you did they would be dates. 
      friendlyName: 'Date last updated',    // so this also governs how they are diaplayed
      type: 'number',
      display: { type: 'datetime', truncateForTableList: 16 },
      database: { type: 'biginteger' },
      process: { updatedAt: true }
    },
    updatedBy: {
      friendlyName: 'Last updated by',
      description: `The person who last updated the row.`,
      type: 'number',
      model: 'user',
      process: { updatedBy: true }
    },

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
      type: 'number',
      description: 'Price of each unit',
      friendlyName: 'Price per unit',
      input: {
        step: .01,
        required: true,
      },
      display: {
        currency: true,
      }
    },
    total: {
      type: 'number',
      description: 'Total price',
      friendlyName: 'Total price',
      input: { hidden: true },
      display: {
        currency: true,
      }
    },
    supplier: {
      type: 'number',
      model: 'user',
      input: { type: 'hidden' },
    }

  },

}
