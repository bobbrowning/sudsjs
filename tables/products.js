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
    let formatter = new Intl.NumberFormat(
      suds.currency.locale,
      {
        style: 'currency',
        currency: suds.currency.currency,
        minimumFractionDigits: suds.currency.digits,
      })
    price = formatter.format(record.price);
    return `${record.name} (No: ${record.id}) Price: ${price}`
  },
  list: {
    columns: ['id', 'updatedAt', 'id', 'name', 'supplier', 'price'],
  },
  permission: { all: ['admin', 'purchasing'], view: ['sales'] },
  groups: {
    basic: {
      static: true,
      columns: ['id', 'name', 'price'],
    },
    details: {
      columns: ['supplier', 'vatable', 'class', 'overview',],
    },
    transactions: {
      columns: ['purchases', 'sales'],
      open: 'sales',
    },
    related: {
      friendlyName: 'Related Products',
      columns: ['subproductOf', 'subproducts',],
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
      description: 'Unit price',
      input: {
        width: '150px',
        step: .01,
        required: true,
      },
      display: { currency: true },
      friendlyName: 'Sales price',
    },
    vatable: {
      type: 'boolean',
      description: 'Whether subject to VAT',
    },
    class: {
      type: 'string',
      input: {
        type: 'select',
        values: ['houshold', 'sports', 'toys', 'auto', 'destructive'],
      }
    },
    overview: {
      type: 'string',
      input: {
        type: 'textarea',
        rows: 4,
        placeholder: 'Enter a brief description of the product',
      },
    },
    description: {
      type: 'string',
      input: {
        format: 'col',
        type: 'summernote',
        height: 300,
        placeholder: 'Please enter page content'
      },
      display: { truncateForTableList: 50 },
    },
    subproductOf: {
      collection: 'productjoin',
      via: 'subproduct',
      friendlyName: 'Parent products ',
      collectionList: {
        columns: ['mainproduct'],                       // Heading to the listing Default to table name
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
        columns: ['subproduct'],                       // Heading to the listing Default to table name
        hideEdit: true,
        hideDetails: true,
      },
    },
    purchases: {
      collection: 'purchaseorderlines',
      via: 'product',
    },
    sales: {
      collection: 'salesorderlines',
      via: 'product',
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

