/**
 *Sub Schema
 *
 */

module.exports = {

  description: `This table contains the definitions of different record types.`,

  permission: { view: ['admin', 'demo'] },
  list: {
    columns: ['_id', 'createdAt', 'group','friendlyName'],
  },
  edit: {
    preProcess: function (record) {
      record.subschema = JSON.stringify(eval(record.subschema));
      return;
    },
  },
  rowTitle: 'friendlyName',
  standardHeader: true,
  attributes: {

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
          input: { placeholder: 'Unique field name (no spaces)' },
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




