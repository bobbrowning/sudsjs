/**
 * Spares.js
 *
  */

module.exports = {
 description: 'Spare parts',
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
      display: { type: 'datetime',truncateForTableList: 16 },
      database: { type: 'bigint' },
      process: { createdAt: true }
    },                                      // You don't actually enter these
    updatedAt: {                            // but if you did they would be dates. 
      friendlyName: 'Date last updated',    // so this also governs how they are diaplayed
      type: 'number',
      display: { type: 'datetime',truncateForTableList: 16 },
      database: { type: 'bigint' },
      process: { updatedAt: true }
    },
    updatedBy: {
      friendlyName: 'Last updated by',
      description: `The person who last updated the row.`,
     type: 'number',
      model: 'user',
      process: { updatedBy: true }
    },
     name: {
      type: 'string',
      input: {required: true,},
      description: 'Part name',
    },
    supplier: {
       model: 'user',
    },
    price: {
      type: 'number',
      input: {required: true,},
      description: 'Unit price',
    },
    vatable: {
      type: 'boolean',
      description: 'Whether subject to VAT',
    },
  },
};

