"use strict";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ViamVjdHNkZW5vcm0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGFibGVzL3N1YmplY3RzZGVub3JtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0E7O0lBRUk7QUFDSixNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2IsWUFBWSxFQUFFLHNDQUFzQztJQUNwRCxVQUFVLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsRUFBRTtJQUMxRCxTQUFTLEVBQUUsTUFBTTtJQUNqQixJQUFJLEVBQUU7UUFDRixPQUFPLEVBQUUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLEVBQUUsa0NBQWtDO0tBQ2xFO0lBQ0QsVUFBVSxFQUFFO1FBQ1I7dUdBQytGO1FBQy9GLElBQUksRUFBRSxrQ0FBa0M7UUFDeEMsSUFBSSxFQUFFO1lBQ0YsSUFBSSxFQUFFLFFBQVE7U0FDakI7UUFDRCxLQUFLLEVBQUU7WUFDSCxJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUU7U0FDOUI7UUFDRCxNQUFNLEVBQUU7WUFDSixLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFO1lBQzNCLElBQUksRUFBRSxRQUFRO1lBQ2QsWUFBWSxFQUFFLFlBQVk7WUFDMUIsVUFBVSxFQUFFO2dCQUNSLElBQUksRUFBRTtvQkFDRixJQUFJLEVBQUUsUUFBUTtpQkFDakI7Z0JBQ0QsS0FBSyxFQUFFO29CQUNILElBQUksRUFBRSxRQUFRO29CQUNkLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUU7aUJBQzlCO2FBQ0o7U0FDSjtLQUNKO0NBQ0osQ0FBQyJ9