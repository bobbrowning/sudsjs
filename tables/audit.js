"use strict";
/**
 * Audit table Schema
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    description: `This table is maintained by the system to record every action. The table can get very 
  large, so it can be automatically trimmed.  The trimming rules are set in the suds configuration file.`,
    permission: { view: ['admin', 'demo'] },
    list: {
        columns: ['createdAt', 'updatedBy', 'tableName', 'mode'],
    },
    properties: {
        /* This inserts a standard header from fragments.js
           The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        tableName: {
            type: 'string',
            database: { type: 'varchar', length: 50, },
        },
        mode: {
            type: 'string',
            database: { type: 'varchar', length: 10, },
        },
        row: {
            type: 'string',
        },
        notes: {
            friendlyName: 'notes',
            type: 'string',
        },
        data: {
            type: 'string',
            input: { type: 'textarea' },
            process: { type: 'JSON' },
            database: { type: 'text' },
        },
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVkaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGFibGVzL2F1ZGl0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQTs7O0dBR0c7O0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRztJQUNiLFdBQVcsRUFBRTt5R0FDd0Y7SUFDckcsVUFBVSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFO0lBQ3ZDLElBQUksRUFBRTtRQUNGLE9BQU8sRUFBRSxDQUFDLFdBQVcsRUFBQyxXQUFXLEVBQUUsV0FBVyxFQUFFLE1BQU0sQ0FBQztLQUMxRDtJQUNELFVBQVUsRUFBRTtRQUNSO3VHQUMrRjtRQUMvRixJQUFJLEVBQUUsa0NBQWtDO1FBQ3hDLFNBQVMsRUFBRTtZQUNQLElBQUksRUFBRSxRQUFRO1lBQ2QsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsRUFBRSxHQUFHO1NBQzdDO1FBQ0QsSUFBSSxFQUFFO1lBQ0YsSUFBSSxFQUFFLFFBQVE7WUFDZCxRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxFQUFFLEdBQUc7U0FDN0M7UUFDRCxHQUFHLEVBQUU7WUFDRCxJQUFJLEVBQUUsUUFBUTtTQUNqQjtRQUNELEtBQUssRUFBRTtZQUNILFlBQVksRUFBRSxPQUFPO1lBQ3JCLElBQUksRUFBRSxRQUFRO1NBQ2pCO1FBQ0QsSUFBSSxFQUFFO1lBQ0YsSUFBSSxFQUFFLFFBQVE7WUFDZCxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFO1lBQzNCLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUU7WUFDekIsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRTtTQUM3QjtLQUNKO0NBQ0osQ0FBQyJ9