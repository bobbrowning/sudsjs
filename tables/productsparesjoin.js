"use strict";
/**
 * Product / Spares Join Table.js
 *
  */
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    description: `Product / Spare parts join table. There is a many-to-many relationship between 
 products and spare parts.  A spare can be used in many products and a product 
 can have many spare parts. 
 This table enables this by linking the two files. 
 There is one record for each time a spare part id used in a product.`,
    properties: {
        id: {
            friendlyName: 'User No',
            type: 'number',
            primaryKey: true,
            autoincrement: true,
        },
        createdAt: {
            friendlyName: 'Date created',
            type: 'number',
            display: { type: 'datetime', truncateForTableList: 16 },
            database: { type: 'bigint' },
            process: { createdAt: true }
        },
        updatedAt: {
            friendlyName: 'Date last updated',
            type: 'number',
            display: { type: 'datetime', truncateForTableList: 16 },
            database: { type: 'bigint' },
            process: { updatedAt: true }
        },
        updatedBy: {
            friendlyName: 'Last updated by',
            description: `The person who last updated the row.`,
            type: 'number',
            model: 'user',
            process: { updatedBy: true }
        },
        product: {
            model: 'products',
        },
        spare: {
            model: 'spares',
        },
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZHVjdHNwYXJlc2pvaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGFibGVzL3Byb2R1Y3RzcGFyZXNqb2luLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQTs7O0lBR0k7O0FBRUosTUFBTSxDQUFDLE9BQU8sR0FBRztJQUNiLFdBQVcsRUFBRTs7OztzRUFJcUQ7SUFDbEUsVUFBVSxFQUFFO1FBQ1IsRUFBRSxFQUFFO1lBQ0EsWUFBWSxFQUFFLFNBQVM7WUFDdkIsSUFBSSxFQUFFLFFBQVE7WUFDZCxVQUFVLEVBQUUsSUFBSTtZQUNoQixhQUFhLEVBQUUsSUFBSTtTQUN0QjtRQUNELFNBQVMsRUFBRTtZQUNQLFlBQVksRUFBRSxjQUFjO1lBQzVCLElBQUksRUFBRSxRQUFRO1lBQ2QsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxvQkFBb0IsRUFBRSxFQUFFLEVBQUU7WUFDdkQsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtZQUM1QixPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFO1NBQy9CO1FBQ0QsU0FBUyxFQUFFO1lBQ1AsWUFBWSxFQUFFLG1CQUFtQjtZQUNqQyxJQUFJLEVBQUUsUUFBUTtZQUNkLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsb0JBQW9CLEVBQUUsRUFBRSxFQUFFO1lBQ3ZELFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDNUIsT0FBTyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRTtTQUMvQjtRQUNELFNBQVMsRUFBRTtZQUNQLFlBQVksRUFBRSxpQkFBaUI7WUFDL0IsV0FBVyxFQUFFLHNDQUFzQztZQUNuRCxJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxNQUFNO1lBQ2IsT0FBTyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRTtTQUMvQjtRQUNELE9BQU8sRUFBRTtZQUNMLEtBQUssRUFBRSxVQUFVO1NBQ3BCO1FBQ0QsS0FBSyxFQUFFO1lBQ0gsS0FBSyxFQUFFLFFBQVE7U0FDbEI7S0FDSjtDQUNKLENBQUMifQ==