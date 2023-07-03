"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * Student table - normalised moned
 *
 */
module.exports = {
    description: 'Student - normalised model',
    friendlyName: 'Student',
    stringify: 'name',
    permission: { all: ['admin', 'demo', 'trainer', 'demor'] },
    list: {
        columns: ['name', 'address1', 'address2', 'city', 'zip', 'results'],
        open: 'results',
    },
    properties: {
        /* This inserts a standard header from fragments.js
          The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        name: {
            type: 'string'
        },
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
    children: {
        results: {
            collection: 'results',
            via: 'studentId',
            friendlyName: 'Results',
            collectionList: {
                limit: 999,
                order: '_id',
                direction: 'DESC',
                addRow: 'Add a new result',
                columns: ['subject', 'paper', 'score'],
            },
        },
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R1ZGVudG5vcm0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGFibGVzL3N0dWRlbnRub3JtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0E7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDYixXQUFXLEVBQUUsNEJBQTRCO0lBQ3pDLFlBQVksRUFBRSxTQUFTO0lBQ3ZCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLFVBQVUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxFQUFFO0lBQzFELElBQUksRUFBRTtRQUNGLE9BQU8sRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDO1FBQ25FLElBQUksRUFBRSxTQUFTO0tBQ2xCO0lBQ0QsVUFBVSxFQUFFO1FBQ1I7c0dBQzhGO1FBQzlGLElBQUksRUFBRSxrQ0FBa0M7UUFDeEMsSUFBSSxFQUFFO1lBQ0YsSUFBSSxFQUFFLFFBQVE7U0FDakI7UUFDRCxRQUFRLEVBQUU7WUFDTixJQUFJLEVBQUUsUUFBUTtTQUNqQjtRQUNELFFBQVEsRUFBRTtZQUNOLElBQUksRUFBRSxRQUFRO1NBQ2pCO1FBQ0QsSUFBSSxFQUFFO1lBQ0YsSUFBSSxFQUFFLFFBQVE7U0FDakI7UUFDRCxHQUFHLEVBQUU7WUFDRCxJQUFJLEVBQUUsUUFBUTtTQUNqQjtLQUNKO0lBQ0QsUUFBUSxFQUFFO1FBQ04sT0FBTyxFQUFFO1lBQ0wsVUFBVSxFQUFFLFNBQVM7WUFDckIsR0FBRyxFQUFFLFdBQVc7WUFDaEIsWUFBWSxFQUFFLFNBQVM7WUFDdkIsY0FBYyxFQUFFO2dCQUNaLEtBQUssRUFBRSxHQUFHO2dCQUNWLEtBQUssRUFBRSxLQUFLO2dCQUNaLFNBQVMsRUFBRSxNQUFNO2dCQUNqQixNQUFNLEVBQUUsa0JBQWtCO2dCQUMxQixPQUFPLEVBQUUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQzthQUN6QztTQUNKO0tBQ0o7Q0FDSixDQUFDIn0=