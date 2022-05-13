/**
 *Sub Schema
 *
 */

module.exports = {

  description: `This table contains the definitions of different record types.`,

  permission: { view: ['admin', 'demo'] },
  list: {
    columns: ['_id', 'createdAt', 'group', 'subschemaName','friendlyName'],
  },
  preProcess: function (record) {
    record.subschema = JSON.stringify(eval(record.subschema));
    return;
  },
  rowTitle: 'friendlyName',
  attributes: {
    _id: {
      friendlyName: 'Number',                            // Visible name 
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
      type: 'string',
      model: 'user',
      process: { updatedBy: true }
    },
    group: {
      type: 'string',
      input: {
        type: 'select',
        database: { type: 'varchar', length: 50, },
      },
      values: function () {
        return require('../config/suds').subSchemaGroups;
      },

    },
    friendlyName: { type: 'string' },
    item: {
      array: { type: 'multiple', bite: 5 },
      type: 'object',
      object: {
        name: {
          type: 'string',
          friendlyName: 'Field/Object Name',
          input: {placeholder: 'Unique field name (no spaces)'},  
        },
        spec: {
          type: 'string',
          description: 'Valid JSON specification of the field or object',
          friendlyName: 'Specification',
          input: { 
            type: 'textarea', 
            validations: {
              api: {                                         // Validation is by module in bin/suds/api/unique.js
                  route: '/json',
              }
          },
            placeholder: `{
  &quot;type&quot;: &quot;string&quot;
}`
          },
        }
      },
    },
  }
}




