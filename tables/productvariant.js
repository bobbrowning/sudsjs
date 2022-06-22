/**
 * Product variant table schema
 *
  */

module.exports = {
   friendlyName: 'Main product to Sub product link',

   description: 'Used to link products, such as product/spares or product/accessories.',

  permission: { all: ['admin', 'purchasing','demo'], view: ['sales'] },
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
     return `${record.name} Guide retail price: ${price}`;
  },
  standardHeader: true,
  attributes: {
 
    product: {
      model: 'products',
      input: {
        type: 'autocomplete',
        limit: 5,                   // number of options returned
        search: {
          andor: 'and',
          searches: [
            ['name', 'contains', '#input'],
          ],
        },
        width: '80%',
        minLength: 2,               // min characters entered before search
        placeholder: 'Number or type name (case sensitive)',
        idPrefix: 'Product number: ',
      },
      display: {
        linkedTable: 'product',      // if omitted will be picked up from the model
        makeLink: true,             // hypertext link to the linked table
      },
    },
    name: {type: 'string' },
    price: {
      type: 'number',
      friendlyName: 'Guide retail unit price',
      input: {
        width: '150px',
        step: .01,
        required: true,
      },
      display: { currency: true },
    },
    note: {type: 'string' },
  },
}