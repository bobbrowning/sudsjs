"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * Student table - normalised moned
 *
 * Not used any more...
 *
 */
let suds = require('../config/suds');
let db = require('../bin/suds/db');
module.exports = {
    description: 'Exam results',
    friendlyName: 'Exams taken',
    permission: { all: ['admin', 'demo', 'trainer'] },
    list: {
        columns: ['studentId', 'subject',],
    },
    stringify: async function (record) {
        let ex = await db.getRow('subjects', record.subject);
        return (ex.name);
    },
    properties: {
        /* This inserts a standard header from fragments.js
           The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        studentId: {
            model: 'studentnorm',
            friendlyName: 'Student',
            input: {
                type: 'autocomplete',
                search: 'name',
                required: true,
                placeholder: 'Start typing Student name',
            },
        },
        subject: {
            type: 'string',
            model: 'subjects',
            input: { type: 'select', },
        },
    },
    children: {
        results: {
            collection: 'results',
            via: 'exam',
            friendlyName: 'Results',
            collectionList: {
                limit: 999,
                order: '_id',
                direction: 'DESC',
                addRow: 'Add a new result',
                columns: ['paper', 'score'],
            },
        }
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhhbXN0YWtlbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90YWJsZXMvZXhhbXN0YWtlbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7R0FNRztBQUNILElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3JDLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ25DLE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDYixXQUFXLEVBQUUsY0FBYztJQUMzQixZQUFZLEVBQUUsYUFBYTtJQUMzQixVQUFVLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFNBQVMsQ0FBQyxFQUFFO0lBQ2pELElBQUksRUFBRTtRQUNGLE9BQU8sRUFBRSxDQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUU7S0FDckM7SUFDRCxTQUFTLEVBQUUsS0FBSyxXQUFXLE1BQU07UUFDN0IsSUFBSSxFQUFFLEdBQUcsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckQsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBQ0QsVUFBVSxFQUFFO1FBQ1I7dUdBQytGO1FBQy9GLElBQUksRUFBRSxrQ0FBa0M7UUFDeEMsU0FBUyxFQUFFO1lBQ1AsS0FBSyxFQUFFLGFBQWE7WUFDcEIsWUFBWSxFQUFFLFNBQVM7WUFDdkIsS0FBSyxFQUFFO2dCQUNILElBQUksRUFBRSxjQUFjO2dCQUNwQixNQUFNLEVBQUUsTUFBTTtnQkFDZCxRQUFRLEVBQUUsSUFBSTtnQkFDZCxXQUFXLEVBQUUsMkJBQTJCO2FBQzNDO1NBQ0o7UUFDRCxPQUFPLEVBQUU7WUFDTCxJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxVQUFVO1lBQ2pCLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEdBQUc7U0FDN0I7S0FDSjtJQUNELFFBQVEsRUFBRTtRQUNOLE9BQU8sRUFBRTtZQUNMLFVBQVUsRUFBRSxTQUFTO1lBQ3JCLEdBQUcsRUFBRSxNQUFNO1lBQ1gsWUFBWSxFQUFFLFNBQVM7WUFDdkIsY0FBYyxFQUFFO2dCQUNaLEtBQUssRUFBRSxHQUFHO2dCQUNWLEtBQUssRUFBRSxLQUFLO2dCQUNaLFNBQVMsRUFBRSxNQUFNO2dCQUNqQixNQUFNLEVBQUUsa0JBQWtCO2dCQUMxQixPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDO2FBQzlCO1NBQ0o7S0FDSjtDQUNKLENBQUMifQ==