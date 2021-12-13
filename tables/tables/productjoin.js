/**
 * ProductJoins.js
 *
  */

module.exports = {
  description: 'Product Join',
   friendlyName: 'Main product to Sub product link',
  extendedDescription: 'Used to link products, such as product/spares or product/accessories.',
  permission: { all: ['admin', 'purchasing','demo'], view: ['sales'] },
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
      input: {type: 'radio'},
      values: {
        C: 'Component / spare part',
        A: 'Accessory',
      }
    }
  },
}