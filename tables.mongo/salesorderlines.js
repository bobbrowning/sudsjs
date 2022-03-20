/**
 * Sales order lines table schema
 *
  */

let db = require('../bin/suds/db-mongo');
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
  rowTitle: async function (record) {
    let product = await db.getRow('products', record.product);
    let customer = await db.getRow('user', record.customer);
    return `${record.units} X ${product.name} for ${customer.fullName}`;
  },
 /**  This allows you to vary the input form depending on the record type.  */
 recordTypeColumn: 'product',


  edit: {
    /** This function reads the sales order data and fills out the customer number in the form */
    preForm: async function (record, mode) {
      if (record.orderNo) {
        let so = await db.getRow('salesorders', record.orderNo,);
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
      let total = await db.totalRows(
        'salesorderlines',
        { searches: [['orderNo', 'eq', record.orderNo]] },
        'total');
      await db.updateRow('salesorders', { _id: record.orderNo, totalValue: total });
      return;
    },

  },
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
        onchange: `
        let title=ui.item.label;
        console.log(title);
        if (title) {
          let array=title.split('£'); 
          console.log('start',array[1]);
          document.getElementById('price').value=array[1];
       }`,
      },
      display: {
        linkedTable: 'products',      // if omitted will be picked up from the model
        makeLink: true,             // hypertext link to the linked table
      },
    },
    variant: {
      model: 'productvariant',
      input: {
        type: 'select',
        search: { searches: [['product', 'eq', '$product']] },

      }
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

}
