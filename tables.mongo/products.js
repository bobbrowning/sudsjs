/**
 * Products table schema
 *
 */

module.exports = {

  friendlyName: 'Products',

  description: `One record for each product that the organisation deals in.`,

  rowTitle: function (record) {
    let suds = require('../config/suds')
    let formatter = new Intl.NumberFormat(
      suds.currency.locale,
      {
        style: 'currency',
        currency: suds.currency.currency,
        minimumFractionDigits: suds.currency.digits,
      });
    let price = '';
    if (record.variants && record.variants.length) {
      for (let i = 0; i < record.variants.length; i++) {
        if (i > 0) { price += ' / ' }
        price += formatter.format(record.variants[i].salesPrice);
      }
    }
    else {
      price = 'TBD';
    }
    return `${record.name} (Guide retail price(s): ${price})`
  },

  subschema: {
    key: 'productGroup',
  },
  list: {
    columns: ['name', 'productGroup', 'supplier', 'price'],
  },
  permission: { all: ['admin', 'purchasing', 'demo'], view: ['sales'] },
  groups: {
    basic: {
      static: true,
      columns: ['_id', 'name', 'productGroup','supplier'],
    },
    activityLog: {
      friendlyName: 'Activity Log',
      activityLog: true,                                                       // This is the activity log
      limit: 10,                                                               // Maximum entries shown (defaults to 10)
      activities: ['salesorderlines', 'purchaseorderlines'],              // These shild records are included
      permission: { view: ['sales', 'purchasing', 'admin', 'demo'] },
    },
    details: {
      friendlyName: 'Details',
      columns: ['overview', 'image'],
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
  },
  attributes: {
    _id: {
      friendlyName: 'Product No',                            // Visible name 
      primaryKey: true,
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
      display: { type: 'checkboxes' },
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


    associatedProducts: {
      type: 'object',
      array: { type: 'multiple', bite: 2 },
      object: {
        product: {
          friendyName: 'associated products',
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

    variants: {
      type: 'object',
      friendlyName: 'Variant',
      array: { type: 'multiple', bite: 5 },
      object: {
        friendlyName: { type: 'string' },
        SKU: {
          type: 'string',
          description: `Only include SKU if there are no subvariants`
        },
        description: {
          type: 'string',
          input: { type: 'textarea' },
          price: {
            type: 'number',
          }
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
          array: { type: 'multiple', bite: 5 },
          object: {
            friendlyName: { type: 'string' },
            SKU: {
              type: 'string',
            },

          }
        }
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

