"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * Results table - normalised moned
 *
 */
let suds = require('../config/suds');
let db = require('../bin/suds/db');
module.exports = {
    description: 'Exam results',
    friendlyName: 'Exam results',
    permission: { all: ['admin', 'demo', 'trainer', 'demor'] },
    list: {
        columns: ['subject', 'studentId', 'paper', 'score'],
    },
    recordTypeColumn: 'subject',
    recordTypeInput: 'select',
    properties: {
        /* This inserts a standard header from fragments.js
            The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        studentId: {
            model: 'studentnorm',
            friendlyName: 'Student',
            input: { type: 'select', mandatory: true },
        },
        subject: {
            type: 'string',
            model: 'subjects',
            input: {
                type: 'readonly',
            },
        },
        paper: {
            type: 'string',
            model: 'papers',
            input: {
                type: 'select',
                search: {
                    andor: 'and',
                    searches: [
                        ['subject', 'equals', '$subject'], // Refers top the global that we set in the preForm routine
                    ],
                },
            },
        },
        score: {
            type: 'number',
            input: { type: 'number', max: 100, },
        },
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdWx0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90YWJsZXMvcmVzdWx0cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBOzs7O0dBSUc7QUFDSCxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNyQyxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNuQyxNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2IsV0FBVyxFQUFFLGNBQWM7SUFDM0IsWUFBWSxFQUFFLGNBQWM7SUFDNUIsVUFBVSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLEVBQUU7SUFDMUQsSUFBSSxFQUFFO1FBQ0YsT0FBTyxFQUFFLENBQUMsU0FBUyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDO0tBQ3REO0lBQ0QsZ0JBQWdCLEVBQUUsU0FBUztJQUMzQixlQUFlLEVBQUUsUUFBUTtJQUN6QixVQUFVLEVBQUU7UUFDUjt3R0FDZ0c7UUFDaEcsSUFBSSxFQUFFLGtDQUFrQztRQUN4QyxTQUFTLEVBQUU7WUFDUCxLQUFLLEVBQUUsYUFBYTtZQUNwQixZQUFZLEVBQUUsU0FBUztZQUN2QixLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUU7U0FDN0M7UUFDRCxPQUFPLEVBQUU7WUFDTCxJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxVQUFVO1lBQ2pCLEtBQUssRUFBRTtnQkFDSCxJQUFJLEVBQUUsVUFBVTthQUNuQjtTQUNKO1FBQ0QsS0FBSyxFQUFFO1lBQ0gsSUFBSSxFQUFFLFFBQVE7WUFDZCxLQUFLLEVBQUUsUUFBUTtZQUNmLEtBQUssRUFBRTtnQkFDSCxJQUFJLEVBQUUsUUFBUTtnQkFDZCxNQUFNLEVBQUU7b0JBQ0osS0FBSyxFQUFFLEtBQUs7b0JBQ1osUUFBUSxFQUFFO3dCQUNOLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsRUFBRSwyREFBMkQ7cUJBQ2pHO2lCQUNKO2FBQ0o7U0FDSjtRQUNELEtBQUssRUFBRTtZQUNILElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHO1NBQ3ZDO0tBQ0o7Q0FDSixDQUFDIn0=