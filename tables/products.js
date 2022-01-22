/**
 * Products.js
 *
  */

module.exports = {
  description: 'Products',
  extendedDescription: `One record for each product that the organisation deals in.`,
  friendlyName: 'Products',
  rowTitle: function (record) {
    let suds = require('../config/suds')
    if (record.price) {
    let formatter = new Intl.NumberFormat(
      suds.currency.locale,
      {
        style: 'currency',
        currency: suds.currency.currency,
        minimumFractionDigits: suds.currency.digits,
      })
    price = formatter.format(record.price);
    }
    else {
      price='See variants';
    }
    return `${record.name} (No: ${record.id}) Guide retail price: ${price}`
  },
  list: {
    columns: ['id', 'updatedAt', 'id', 'name', 'class', 'supplier', 'price'],
  },
  permission: { all: ['admin', 'purchasing', 'demo'], view: ['sales'] },
  groups: {
    basic: {
      static: true,
      columns: ['id', 'name', 'price'],
    },
    activityLog: {
      friendlyName: 'Activity Log',
      activityLog: true,                                                       // This is the activity log
      limit: 10,                                                               // Maximum entries shown (defaults to 10)
      activities: ['salesorderlines','purchaseorderlines'],              // These shild records are included
      permission: { view: ['sales', 'purchasing', 'admin', 'demo'] },
    },
    details: {
      friendlyName: 'Details',
      columns: ['supplier', 'vatable', 'stockLevel','class', 'overview', 'image'],
    },
    transactions: {
      friendlyName: 'Transactions',
      columns: ['purchases', 'sales'],
      open: 'sales',
    },
    related: {
      friendlyName: 'Related Products',
      columns: ['subproductOf', 'subproducts','variants'],
    },
    description: {
      friendlyName: 'Full description',
      columns: ['description'],
    },
  },
  attributes: {
    id: {
      friendlyName: 'Product No',                            // Visible name 
      type: 'number',
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
      process: { updatedBy: true },
      input: { hidden: true }
    },

    name: {
      type: 'string',
      description: 'Product name',
      input: {
        placeholder: 'Enter the name of the product',
        required: true,
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
    price: {
      type: 'number',
      friendlyName: 'Guide retail unit price',
      input: {
        width: '150px',
        step: .01,

       },
      display: { currency: true },
    },
    vatable: {
      type: 'boolean',
      description: 'Whether subject to VAT',
    },
    stockLevel: {type: 'number'},

    class: {
      type: 'string',
      friendlyName: 'Market(s)',
      description: 'Check those that apply',
      values: {
        H: 'Houshold',
        S: 'Sports',
        T: 'Toys',
        A: 'Auto',
        HW: 'Hardware',
        AG: 'Agricultural',
        O: 'Other'
      },
      input: {
        type: 'checkboxes',
      },
      process: { JSON: true },
      display: { type: 'checkboxes' },
    },
    overview: {
      type: 'string',
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
      input: {
        format: 'col',
        type: 'ckeditor4',
        height: 300,
        placeholder: 'Please enter product description'
      },
      display: { truncateForTableList: 50 },
    },
    subproductOf: {
      collection: 'productjoin',
      via: 'subproduct',
      friendlyName: 'Parent products ',
      collectionList: {
        columns: ['type', 'mainproduct'],                       // Heading to the listing Default to table name
        heading: 'Parent products / Spare for',                         // Heading to the listing Default to table name
        hideEdit: true,
        hideDetails: true,
      },
    },
    subproducts: {
      collection: 'productjoin',
      via: 'mainproduct',
      friendlyName: 'Sub products / Spare parts',
      collectionList: {
        open: true,
        columns: ['type', 'subproduct'],                       // Heading to the listing Default to table name
        hideEdit: true,
        hideDetails: true,
      },
    },
    variants: {
      collection: 'productvariant',
      via: 'product',
      friendlyName: 'Product variants',
      collectionList: {
        open: true,
        columns: ['name', 'price' ],                       
       },
    },
    purchases: {
      collection: 'purchaseorderlines',
      via: 'product',
      addRow: false,
     },
    sales: {
      collection: 'salesorderlines',
      via: 'product',
      addRow: false,
      annotate: {
        total: {
          type: 'count',
          friendlyName: 'Number of sales',
        },
        salesValue: {
          type: 'sum',
          col: 'total',
          friendlyName: 'Total Value',
          currency: true,
        }
      }
    },
  },
};

