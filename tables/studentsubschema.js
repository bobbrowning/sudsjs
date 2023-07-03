"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * Student table - normalised moned
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
let suds = require('../config/suds');
let db = require('../bin/suds/db');
let lookup = require('../bin/suds/lookup-value');
module.exports = {
    description: 'Student - normalised model',
    friendlyName: 'Student',
    stringify: 'name',
    permission: { all: ['admin', 'demo', 'trainer', 'demov'] },
    list: {
        columns: ['name', 'address', 'subjects'],
        subschemaName: 'exams',
    },
    standardHeader: true,
    subschema: {
        key: 'subjects',
    },
    properties: {
        /* This inserts a standard header from fragments.js
           The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        name: {
            type: 'string'
        },
        address: {
            type: 'object',
            properties: {
                address1: {
                    type: 'string'
                },
                address2: {
                    type: 'string'
                },
                city: {
                    type: 'string'
                },
                zip: {
                    type: 'string'
                },
            },
        },
        subjects: {
            type: 'string',
            array: { type: 'single' },
            friendlyName: 'Subjects taken',
            description: 'Check those that apply',
            model: 'subschema',
            input: {
                type: 'checkboxes',
                search: {
                    searches: [
                        ['group', 'eq', 'exams'],
                    ]
                }
            },
            display: { type: 'list' },
        }
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R1ZGVudHN1YnNjaGVtYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90YWJsZXMvc3R1ZGVudHN1YnNjaGVtYS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBQ2I7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzlELElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3JDLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ25DLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBQ2pELE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDYixXQUFXLEVBQUUsNEJBQTRCO0lBQ3pDLFlBQVksRUFBRSxTQUFTO0lBQ3ZCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLFVBQVUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxFQUFFO0lBQzFELElBQUksRUFBRTtRQUNGLE9BQU8sRUFBRSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDO1FBQ3hDLGFBQWEsRUFBRSxPQUFPO0tBQ3pCO0lBQ0QsY0FBYyxFQUFFLElBQUk7SUFDcEIsU0FBUyxFQUFFO1FBQ1AsR0FBRyxFQUFFLFVBQVU7S0FDbEI7SUFDRCxVQUFVLEVBQUU7UUFDUjt1R0FDK0Y7UUFDL0YsSUFBSSxFQUFFLGtDQUFrQztRQUN4QyxJQUFJLEVBQUU7WUFDRixJQUFJLEVBQUUsUUFBUTtTQUNqQjtRQUNELE9BQU8sRUFBRTtZQUNMLElBQUksRUFBRSxRQUFRO1lBQ2QsVUFBVSxFQUFFO2dCQUNSLFFBQVEsRUFBRTtvQkFDTixJQUFJLEVBQUUsUUFBUTtpQkFDakI7Z0JBQ0QsUUFBUSxFQUFFO29CQUNOLElBQUksRUFBRSxRQUFRO2lCQUNqQjtnQkFDRCxJQUFJLEVBQUU7b0JBQ0YsSUFBSSxFQUFFLFFBQVE7aUJBQ2pCO2dCQUNELEdBQUcsRUFBRTtvQkFDRCxJQUFJLEVBQUUsUUFBUTtpQkFDakI7YUFDSjtTQUNKO1FBQ0QsUUFBUSxFQUFFO1lBQ04sSUFBSSxFQUFFLFFBQVE7WUFDZCxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO1lBQ3pCLFlBQVksRUFBRSxnQkFBZ0I7WUFDOUIsV0FBVyxFQUFFLHdCQUF3QjtZQUNyQyxLQUFLLEVBQUUsV0FBVztZQUNsQixLQUFLLEVBQUU7Z0JBQ0gsSUFBSSxFQUFFLFlBQVk7Z0JBQ2xCLE1BQU0sRUFBRTtvQkFDSixRQUFRLEVBQUU7d0JBQ04sQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQztxQkFDM0I7aUJBQ0o7YUFDSjtZQUNELE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUU7U0FDNUI7S0FDSjtDQUNKLENBQUMifQ==