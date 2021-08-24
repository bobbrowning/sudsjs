/**
 * Orderlines.js
 *
  */



module.exports = {
  description: 'Order lines',
   friendlyName: 'Sales Order Lines',
  permission: {
    all: ['sales', 'admin'],
    view: ['purchasing'],
  },
  list: {
    columns: ['updatedAt', 'id', 'orderNo', 'product', 'total'],
  },
  edit: {
    preProcess: function (record) {
      record.total = record.units * record.price;
      return record;
    },

    postProcess: async function (record, operation) {
      let totalRows= require('../bin/suds/total-rows')
      let updateRow= require('../bin/suds/update-row')
      let total = await totalRows('salesorderlines',{searches: [['orderNo','eq',record.orderNo]]},'total')
      await updateRow('salesorders', {id: record.orderNo, total: total });
      return;
    },

  },
  attributes: {
    id: {
      friendlyName: 'User No',                            // Visible name 
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

    orderNo: {
      description: 'Order',
      model: 'salesorders',
      input: {required: true,},
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
    units: {
      type: 'number',
      //     required: true,
      description: 'Number of units ordered',
       friendlyName: 'Number of units',
      input: {
        type: 'text',
        isInteger: true,
        //     min: 2,
        max: 100,
       },
 },
    price: {
      type: 'number',
      input: { step: .01, },
      display: { currency: true },
   },
    total: {
      type: 'number',
      input: { hidden: true },
      display: { currency: true },
 }

  },

}