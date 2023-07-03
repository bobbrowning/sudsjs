"use strict";
/**
 * Subjects collection
  */
Object.defineProperty(exports, "__esModule", { value: true });
let suds = require('../config/suds');
let db = require('../bin/suds/db');
let lookup = require('../bin/suds/lookup-value');
module.exports = {
    permission: { all: ['admin', 'demo', 'trainer', 'demor', 'demod'] },
    friendlyName: 'Exam papers',
    stringify: 'name',
    list: {
        columns: ['name', 'notes'],
        stringify: 'name',
    },
    properties: {
        /* This inserts a standard header from fragments.js
           The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        name: {
            type: 'string',
        },
        notes: {
            type: 'string',
            input: { type: 'textarea' }
        },
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFwZXJzZGVub3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RhYmxlcy9wYXBlcnNkZW5vcm0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBOztJQUVJOztBQUVKLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3JDLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ25DLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBQ2pELE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDYixVQUFVLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLEVBQUU7SUFDbkUsWUFBWSxFQUFFLGFBQWE7SUFDM0IsU0FBUyxFQUFFLE1BQU07SUFDakIsSUFBSSxFQUFFO1FBQ0YsT0FBTyxFQUFFLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQztRQUMxQixTQUFTLEVBQUUsTUFBTTtLQUNwQjtJQUNELFVBQVUsRUFBRTtRQUNSO3VHQUMrRjtRQUMvRixJQUFJLEVBQUUsa0NBQWtDO1FBQ3hDLElBQUksRUFBRTtZQUNGLElBQUksRUFBRSxRQUFRO1NBQ2pCO1FBQ0QsS0FBSyxFQUFFO1lBQ0gsSUFBSSxFQUFFLFFBQVE7WUFDZCxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFO1NBQzlCO0tBQ0o7Q0FDSixDQUFDIn0=