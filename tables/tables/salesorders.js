/**
 * Orders.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
 let db = require('../bin/suds/db');

module.exports = {
  description: 'Customer orders',
   permission: { all: ['sales', 'admin','demo'], view: ['purchasing'] },
  friendlyName: 'Sales orders',   // text in the link to add a new row  

  rowTitle: function (record) {
    return `Order no:${record.id} - Value: £${record.totalValue}`;
  },

  list: {
    columns: ['updatedAt', 'id', 'customer','status', 'date'],
    open: 'salesorderlines',
  },
  edit: {
    postProcess: async function (record, operation) {
      if (operation == 'addNew') {
        await db.updateRow('user', {
          id: record.customer,
          userType: 'C',
          lastSale: record.id,
        });
      }
      return;
    },
  },
  attributes: {
    id: {
      friendlyName: 'Order No',                            // Visible name 
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
      process: { updatedBy: true }
    },

    customer: {
      description: 'Customer',
      model: 'user',
       input: {
        type: 'autocomplete',
        search: 'fullName',
        required: true,
      },
      display: {
        openGroup: 'sales',
        open: 'salesorders',
      },
    },
    date: {
      type: 'string',
      description: 'Date (ISO Format) of order',
      example: '2020-10-29 13:59:58.000',
      input: { type: 'date',      required: true,
    },
      friendlyName: 'Sale date',
    },
    notes:
    {
      description: 'Notes about the order, special delivery instructions etc',
      type: 'string',
      input: { type: 'textarea', rows: '5' },
    },
    status:
    {
      description: 'Status of the order',
      type: 'string',
      values: {
        O:'Ordered', 
        P:'Processing', 
        D:'Dispatched',
      },
      input: {
        type: 'select',
       }
    },
    totalValue: {
      type: 'number',
      input: { type: 'hidden' },
      display: { currency: true },
      friendlyName: 'Total order value',
    },
    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    salesorderlines: {
      collection: 'salesorderlines',
      via: 'orderNo',
      collectionList: {                                            // Contact notes are listed below the person's record
        limit: 999,                                 // number of child records listed in the detail page
        open: true,                                // Open this on automatically
        heading: 'Sales Order lines',               //Heading to the listing 
        columns: ['createdAt', 'product', 'units', 'price', 'total'],
      },
    },
  },

}
