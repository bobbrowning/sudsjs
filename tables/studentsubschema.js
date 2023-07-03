"use strict";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R1ZGVudHN1YnNjaGVtYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90YWJsZXMvc3R1ZGVudHN1YnNjaGVtYS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQ0E7Ozs7R0FJRzs7QUFFSCxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNyQyxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNuQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUNqRCxNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2IsV0FBVyxFQUFFLDRCQUE0QjtJQUN6QyxZQUFZLEVBQUUsU0FBUztJQUN2QixTQUFTLEVBQUUsTUFBTTtJQUNqQixVQUFVLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsRUFBRTtJQUMxRCxJQUFJLEVBQUU7UUFDRixPQUFPLEVBQUUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQztRQUN4QyxhQUFhLEVBQUUsT0FBTztLQUN6QjtJQUNELGNBQWMsRUFBRSxJQUFJO0lBQ3BCLFNBQVMsRUFBRTtRQUNQLEdBQUcsRUFBRSxVQUFVO0tBQ2xCO0lBQ0QsVUFBVSxFQUFFO1FBQ1I7dUdBQytGO1FBQy9GLElBQUksRUFBRSxrQ0FBa0M7UUFDeEMsSUFBSSxFQUFFO1lBQ0YsSUFBSSxFQUFFLFFBQVE7U0FDakI7UUFDRCxPQUFPLEVBQUU7WUFDTCxJQUFJLEVBQUUsUUFBUTtZQUNkLFVBQVUsRUFBRTtnQkFDUixRQUFRLEVBQUU7b0JBQ04sSUFBSSxFQUFFLFFBQVE7aUJBQ2pCO2dCQUNELFFBQVEsRUFBRTtvQkFDTixJQUFJLEVBQUUsUUFBUTtpQkFDakI7Z0JBQ0QsSUFBSSxFQUFFO29CQUNGLElBQUksRUFBRSxRQUFRO2lCQUNqQjtnQkFDRCxHQUFHLEVBQUU7b0JBQ0QsSUFBSSxFQUFFLFFBQVE7aUJBQ2pCO2FBQ0o7U0FDSjtRQUNELFFBQVEsRUFBRTtZQUNOLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtZQUN6QixZQUFZLEVBQUUsZ0JBQWdCO1lBQzlCLFdBQVcsRUFBRSx3QkFBd0I7WUFDckMsS0FBSyxFQUFFLFdBQVc7WUFDbEIsS0FBSyxFQUFFO2dCQUNILElBQUksRUFBRSxZQUFZO2dCQUNsQixNQUFNLEVBQUU7b0JBQ0osUUFBUSxFQUFFO3dCQUNOLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUM7cUJBQzNCO2lCQUNKO2FBQ0o7WUFDRCxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFO1NBQzVCO0tBQ0o7Q0FDSixDQUFDIn0=