"use strict";
/**
 *Sub Schema
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Vic2NoZW1hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RhYmxlcy9zdWJzY2hlbWEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBOzs7R0FHRzs7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2IsV0FBVyxFQUFFLGdFQUFnRTtJQUM3RSxVQUFVLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUMsRUFBRTtJQUMxRCxJQUFJLEVBQUU7UUFDRixPQUFPLEVBQUUsQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxjQUFjLENBQUM7S0FDekQ7SUFDRCxJQUFJLEVBQUU7UUFDRixVQUFVLEVBQUUsVUFBVSxNQUFNO1lBQ3hCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDMUQsT0FBTztRQUNYLENBQUM7S0FDSjtJQUNELFNBQVMsRUFBRSxjQUFjO0lBQ3pCLFVBQVUsRUFBRTtRQUNSO3dHQUNnRztRQUNoRyxJQUFJLEVBQUUsa0NBQWtDO1FBQ3hDLEtBQUssRUFBRTtZQUNILElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFO2dCQUNILElBQUksRUFBRSxRQUFRO2dCQUNkLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEVBQUUsR0FBRzthQUM3QztZQUNELE1BQU0sRUFBRTtnQkFDSixPQUFPLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLGVBQWUsQ0FBQztZQUNyRCxDQUFDO1NBQ0o7UUFDRCxZQUFZLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO1FBQ2hDLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUFFO1FBQzVELElBQUksRUFBRTtZQUNGLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRTtZQUNwQyxJQUFJLEVBQUUsUUFBUTtZQUNkLFVBQVUsRUFBRTtnQkFDUixJQUFJLEVBQUU7b0JBQ0YsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsWUFBWSxFQUFFLG1CQUFtQjtvQkFDakMsS0FBSyxFQUFFLEVBQUUsV0FBVyxFQUFFLCtCQUErQixFQUFFO2lCQUMxRDtnQkFDRCxJQUFJLEVBQUU7b0JBQ0YsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsV0FBVyxFQUFFLGlEQUFpRDtvQkFDOUQsWUFBWSxFQUFFLGVBQWU7b0JBQzdCLEtBQUssRUFBRTt3QkFDSCxJQUFJLEVBQUUsVUFBVTt3QkFDaEIsV0FBVyxFQUFFOzRCQUNULEdBQUcsRUFBRTtnQ0FDRCxLQUFLLEVBQUUsT0FBTzs2QkFDakI7eUJBQ0o7d0JBQ0QsV0FBVyxFQUFFOztFQUVuQztxQkFDbUI7aUJBQ0o7YUFDSjtTQUNKO0tBQ0o7Q0FDSixDQUFDIn0=