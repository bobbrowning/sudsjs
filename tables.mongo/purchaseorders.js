/**
 * 
 * Purchase orders table schema
 */

const stock=require('../bin/custom/stock');

module.exports = {
  description: 'Purchase orders',

  friendlyName: 'Purchase Orders',
  
  permission: { all: ['admin', 'purchasing', 'demo'], view: ['sales'] },
 addRow: 'Add new purchase order',   // text in the link to add a new row  
 list: {
   columns: ['_id','supplier','date','status','total'],
 },
 open: 'purchaseorderlines',
  attributes: {
    _id: {
      friendlyName: 'Order No',                            // Visible name 
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

    supplier: {
      description: 'Supplier ID',
      model: 'user',
      input: {
        type: 'autocomplete',
        required: true,
        search: {
          andor: 'and',
          searches: [
            ['fullName', 'contains', '#input'],
            ['userType', 'equals', 'S'],
          ],
        },
        placeholder: 'Number or type name (case sensitive)',
        idPrefix: 'Supplier: ',
      },
      display: {
        openGroup: 'products',
        open: 'purchaseorders',
      },
    },
    date: {
      type: 'string',
      description: 'Date (ISO Format) of order',
      example: '2020-10-29 13:59:58.000',
      input: {
        type: 'date', 
        required: true,
        default: '#today',
      },
    },
    notes:
    {
      description: 'Notes about the order',
      type: 'string',
      input: { type: 'textarea', rows: '5', cols: '40' },
      display: { maxWidth: '400px' },
    },
    total: {
      type: 'number',
      friendlyName: 'Total price',
      input: { type: 'hidden'},
      display: {
        currency: true,
      }
    },
    status:
    {
      description: 'Status of the order',
      type: 'string',
      values: {
        A: 'Order placed',
        B: 'Being processed',
        C: 'Dispatched',
        D: 'Confirmed recieved',
      },
      input: {
        type: 'radio',
      }
    },
    purchaseorderlines: {
      collection: 'purchaseorderlines',
      via: 'purchaseorder',
      friendlyName: 'Purchase Order lines',          //Heading to the listing 
      collectionList: {                                            // Contact notes are listed below the person's record
        limit: 999,                           // number of child records listed in the detail page
        order: '_id',                 // The order in which the are listed 
        direction: 'DESC',                  // ASC or DESC
        addRow: 'Add a new order line',
        columns: ['_id', 'product', 'units', 'unitprice', 'total'],


      },
    },

  },

}
