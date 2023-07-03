"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R1ZGVudG5vcm0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGFibGVzL3N0dWRlbnRub3JtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFDYixNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM5RDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE9BQU8sR0FBRztJQUNiLFdBQVcsRUFBRSw0QkFBNEI7SUFDekMsWUFBWSxFQUFFLFNBQVM7SUFDdkIsU0FBUyxFQUFFLE1BQU07SUFDakIsVUFBVSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLEVBQUU7SUFDMUQsSUFBSSxFQUFFO1FBQ0YsT0FBTyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUM7UUFDbkUsSUFBSSxFQUFFLFNBQVM7S0FDbEI7SUFDRCxVQUFVLEVBQUU7UUFDUjtzR0FDOEY7UUFDOUYsSUFBSSxFQUFFLGtDQUFrQztRQUN4QyxJQUFJLEVBQUU7WUFDRixJQUFJLEVBQUUsUUFBUTtTQUNqQjtRQUNELFFBQVEsRUFBRTtZQUNOLElBQUksRUFBRSxRQUFRO1NBQ2pCO1FBQ0QsUUFBUSxFQUFFO1lBQ04sSUFBSSxFQUFFLFFBQVE7U0FDakI7UUFDRCxJQUFJLEVBQUU7WUFDRixJQUFJLEVBQUUsUUFBUTtTQUNqQjtRQUNELEdBQUcsRUFBRTtZQUNELElBQUksRUFBRSxRQUFRO1NBQ2pCO0tBQ0o7SUFDRCxRQUFRLEVBQUU7UUFDTixPQUFPLEVBQUU7WUFDTCxVQUFVLEVBQUUsU0FBUztZQUNyQixHQUFHLEVBQUUsV0FBVztZQUNoQixZQUFZLEVBQUUsU0FBUztZQUN2QixjQUFjLEVBQUU7Z0JBQ1osS0FBSyxFQUFFLEdBQUc7Z0JBQ1YsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osU0FBUyxFQUFFLE1BQU07Z0JBQ2pCLE1BQU0sRUFBRSxrQkFBa0I7Z0JBQzFCLE9BQU8sRUFBRSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDO2FBQ3pDO1NBQ0o7S0FDSjtDQUNKLENBQUMifQ==