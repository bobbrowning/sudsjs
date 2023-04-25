/**
 * Products table schema
 *
 */

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
      price = 'Price TBD';
    }
    return `${record.name} (Guide retail price(s): ${price})`
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
    columns: ['_id', 'name', 'supplier', 'productGroup'],
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
      activityLog: true,                                                       // This is the activity log
      limit: 10,                                                               // Maximum entries shown (defaults to 10)
      activities: ['salesorders', 'purchaseorderlines'],              // These shild records are included
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
    $ref: '{{dbDriver}}Header',
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
}

