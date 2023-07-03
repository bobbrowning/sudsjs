"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Subjects collection
  */
module.exports = {
    friendlyName: 'Course Subjects (structured version)',
    permission: { all: ['admin', 'demo', 'trainer', 'demod'] },
    stringify: 'name',
    list: {
        columns: ['name', 'papers'], // Columns listed on a normal list
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
        papers: {
            array: { type: 'multiple' },
            type: 'object',
            friendlyName: 'Exam paper',
            properties: {
                name: {
                    type: 'string',
                },
                notes: {
                    type: 'string',
                    input: { type: 'textarea' }
                },
            },
        },
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ViamVjdHNkZW5vcm0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGFibGVzL3N1YmplY3RzZGVub3JtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFDYixNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM5RDs7SUFFSTtBQUNKLE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDYixZQUFZLEVBQUUsc0NBQXNDO0lBQ3BELFVBQVUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxFQUFFO0lBQzFELFNBQVMsRUFBRSxNQUFNO0lBQ2pCLElBQUksRUFBRTtRQUNGLE9BQU8sRUFBRSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsRUFBRSxrQ0FBa0M7S0FDbEU7SUFDRCxVQUFVLEVBQUU7UUFDUjt1R0FDK0Y7UUFDL0YsSUFBSSxFQUFFLGtDQUFrQztRQUN4QyxJQUFJLEVBQUU7WUFDRixJQUFJLEVBQUUsUUFBUTtTQUNqQjtRQUNELEtBQUssRUFBRTtZQUNILElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRTtTQUM5QjtRQUNELE1BQU0sRUFBRTtZQUNKLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUU7WUFDM0IsSUFBSSxFQUFFLFFBQVE7WUFDZCxZQUFZLEVBQUUsWUFBWTtZQUMxQixVQUFVLEVBQUU7Z0JBQ1IsSUFBSSxFQUFFO29CQUNGLElBQUksRUFBRSxRQUFRO2lCQUNqQjtnQkFDRCxLQUFLLEVBQUU7b0JBQ0gsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRTtpQkFDOUI7YUFDSjtTQUNKO0tBQ0o7Q0FDSixDQUFDIn0=