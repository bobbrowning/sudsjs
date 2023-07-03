
/**
 *Sub Schema
 *
 */

module.exports = {
    description: `This table contains the definitions of different record types.`,
    permission: { all: ['admin', 'demo', 'demov', 'trainer'] },
    list: {
        columns: ['_id', 'createdAt', 'group', 'friendlyName'],
    },
    edit: {
        preProcess: function (record) {
            record.subschema = JSON.stringify(eval(record.subschema));
            return;
        },
    },
    stringify: 'friendlyName',
    properties: {
        /* This inserts a standard header from fragments.js
            The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        group: {
            type: 'string',
            input: {
                type: 'select',
                database: { type: 'varchar', length: 50, },
            },
            values: function () {
                return require('../config/suds').subschemaGroups;
            },
        },
        friendlyName: { type: 'string' },
        description: { type: 'string', input: { type: 'textarea' } },
        item: {
            array: { type: 'multiple', bite: 5 },
            type: 'object',
            properties: {
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
                            api: {
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
};
