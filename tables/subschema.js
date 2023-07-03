"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Vic2NoZW1hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RhYmxlcy9zdWJzY2hlbWEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQUNiOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzlELE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDYixXQUFXLEVBQUUsZ0VBQWdFO0lBQzdFLFVBQVUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBQyxFQUFFO0lBQzFELElBQUksRUFBRTtRQUNGLE9BQU8sRUFBRSxDQUFDLEtBQUssRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLGNBQWMsQ0FBQztLQUN6RDtJQUNELElBQUksRUFBRTtRQUNGLFVBQVUsRUFBRSxVQUFVLE1BQU07WUFDeEIsTUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUMxRCxPQUFPO1FBQ1gsQ0FBQztLQUNKO0lBQ0QsU0FBUyxFQUFFLGNBQWM7SUFDekIsVUFBVSxFQUFFO1FBQ1I7d0dBQ2dHO1FBQ2hHLElBQUksRUFBRSxrQ0FBa0M7UUFDeEMsS0FBSyxFQUFFO1lBQ0gsSUFBSSxFQUFFLFFBQVE7WUFDZCxLQUFLLEVBQUU7Z0JBQ0gsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsRUFBRSxHQUFHO2FBQzdDO1lBQ0QsTUFBTSxFQUFFO2dCQUNKLE9BQU8sT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsZUFBZSxDQUFDO1lBQ3JELENBQUM7U0FDSjtRQUNELFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7UUFDaEMsV0FBVyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQUU7UUFDNUQsSUFBSSxFQUFFO1lBQ0YsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFO1lBQ3BDLElBQUksRUFBRSxRQUFRO1lBQ2QsVUFBVSxFQUFFO2dCQUNSLElBQUksRUFBRTtvQkFDRixJQUFJLEVBQUUsUUFBUTtvQkFDZCxZQUFZLEVBQUUsbUJBQW1CO29CQUNqQyxLQUFLLEVBQUUsRUFBRSxXQUFXLEVBQUUsK0JBQStCLEVBQUU7aUJBQzFEO2dCQUNELElBQUksRUFBRTtvQkFDRixJQUFJLEVBQUUsUUFBUTtvQkFDZCxXQUFXLEVBQUUsaURBQWlEO29CQUM5RCxZQUFZLEVBQUUsZUFBZTtvQkFDN0IsS0FBSyxFQUFFO3dCQUNILElBQUksRUFBRSxVQUFVO3dCQUNoQixXQUFXLEVBQUU7NEJBQ1QsR0FBRyxFQUFFO2dDQUNELEtBQUssRUFBRSxPQUFPOzZCQUNqQjt5QkFDSjt3QkFDRCxXQUFXLEVBQUU7O0VBRW5DO3FCQUNtQjtpQkFDSjthQUNKO1NBQ0o7S0FDSjtDQUNKLENBQUMifQ==