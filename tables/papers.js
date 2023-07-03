"use strict";
/**
 * Papers collection
  */
Object.defineProperty(exports, "__esModule", { value: true });
let suds = require('../config/suds');
module.exports = {
    permission: { all: ['admin', 'demo', 'trainer', 'demor', 'demod'] },
    friendlyName: 'Exam papers',
    stringify: async function (data) {
        return (data.name);
    },
    list: {
        columns: ['subject', 'name', 'notes'],
        stringify: 'name',
    },
    properties: {
        /* This inserts a standard header from fragments.js
           The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        subject: {
            model: 'subjects',
            input: { type: 'select' },
        },
        name: {
            type: 'string',
        },
        notes: {
            type: 'string',
            input: { type: 'textarea' }
        },
    },
    children: {
        results: {
            collection: 'results',
            via: 'paper',
            friendlyName: 'Exam results',
            collectionList: {
                columns: ['studentId', 'subject', 'score']
            }
        }
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFwZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RhYmxlcy9wYXBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBOztJQUVJOztBQUVKLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3JDLE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDYixVQUFVLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLEVBQUU7SUFDbkUsWUFBWSxFQUFFLGFBQWE7SUFDM0IsU0FBUyxFQUFFLEtBQUssV0FBVyxJQUFJO1FBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQUNELElBQUksRUFBRTtRQUNGLE9BQU8sRUFBRSxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDO1FBQ3JDLFNBQVMsRUFBRSxNQUFNO0tBQ3BCO0lBQ0QsVUFBVSxFQUFFO1FBQ1I7dUdBQytGO1FBQy9GLElBQUksRUFBRSxrQ0FBa0M7UUFDeEMsT0FBTyxFQUFFO1lBQ0wsS0FBSyxFQUFFLFVBQVU7WUFDakIsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtTQUM1QjtRQUNELElBQUksRUFBRTtZQUNGLElBQUksRUFBRSxRQUFRO1NBQ2pCO1FBQ0QsS0FBSyxFQUFFO1lBQ0gsSUFBSSxFQUFFLFFBQVE7WUFDZCxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFO1NBQzlCO0tBQ0o7SUFDRCxRQUFRLEVBQUU7UUFDTixPQUFPLEVBQUU7WUFDTCxVQUFVLEVBQUUsU0FBUztZQUNyQixHQUFHLEVBQUUsT0FBTztZQUNaLFlBQVksRUFBRSxjQUFjO1lBQzVCLGNBQWMsRUFBRTtnQkFDWixPQUFPLEVBQUUsQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQzthQUM3QztTQUNKO0tBQ0o7Q0FDSixDQUFDIn0=