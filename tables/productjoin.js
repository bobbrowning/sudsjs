/**
 * Product Joins table schema
 *
 */

module.exports = {

  friendlyName: 'Main product to Sub product link',

  description: 'Used to link products, such as product/spares or product/accessories.',
  permission: { all: ['admin', 'purchasing', 'demo'], view: ['sales'] },
  standardHeader: true,
  attributes: {

    mainproduct: {
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
    subproduct: {
      model: 'products',
      child: false,
      input: {
        type: 'autocomplete',
        limit: 5,                   // number of options returned
        search: {
          andor: 'or',
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
    type: {
      input: { type: 'radio' },
      values: {
        C: 'Component / spare part',
        A: 'Accessory',
      }
    }
  },
}