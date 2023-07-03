"use strict";
/**
 * Spares.js
 *
  */
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    description: 'Spare parts',
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
        name: {
            type: 'string',
            input: { required: true, },
            description: 'Part name',
        },
        supplier: {
            model: 'user',
        },
        price: {
            type: 'number',
            input: { required: true, },
            description: 'Unit price',
        },
        vatable: {
            type: 'boolean',
            description: 'Whether subject to VAT',
        },
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BhcmVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RhYmxlcy9zcGFyZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBOzs7SUFHSTs7QUFFSixNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2IsV0FBVyxFQUFFLGFBQWE7SUFDMUIsVUFBVSxFQUFFO1FBQ1IsRUFBRSxFQUFFO1lBQ0EsWUFBWSxFQUFFLFNBQVM7WUFDdkIsSUFBSSxFQUFFLFFBQVE7WUFDZCxVQUFVLEVBQUUsSUFBSTtZQUNoQixhQUFhLEVBQUUsSUFBSTtTQUN0QjtRQUNELFNBQVMsRUFBRTtZQUNQLFlBQVksRUFBRSxjQUFjO1lBQzVCLElBQUksRUFBRSxRQUFRO1lBQ2QsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxvQkFBb0IsRUFBRSxFQUFFLEVBQUU7WUFDdkQsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRTtZQUM1QixPQUFPLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFO1NBQy9CO1FBQ0QsU0FBUyxFQUFFO1lBQ1AsWUFBWSxFQUFFLG1CQUFtQjtZQUNqQyxJQUFJLEVBQUUsUUFBUTtZQUNkLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsb0JBQW9CLEVBQUUsRUFBRSxFQUFFO1lBQ3ZELFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDNUIsT0FBTyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRTtTQUMvQjtRQUNELFNBQVMsRUFBRTtZQUNQLFlBQVksRUFBRSxpQkFBaUI7WUFDL0IsV0FBVyxFQUFFLHNDQUFzQztZQUNuRCxJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxNQUFNO1lBQ2IsT0FBTyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRTtTQUMvQjtRQUNELElBQUksRUFBRTtZQUNGLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksR0FBRztZQUMxQixXQUFXLEVBQUUsV0FBVztTQUMzQjtRQUNELFFBQVEsRUFBRTtZQUNOLEtBQUssRUFBRSxNQUFNO1NBQ2hCO1FBQ0QsS0FBSyxFQUFFO1lBQ0gsSUFBSSxFQUFFLFFBQVE7WUFDZCxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxHQUFHO1lBQzFCLFdBQVcsRUFBRSxZQUFZO1NBQzVCO1FBQ0QsT0FBTyxFQUFFO1lBQ0wsSUFBSSxFQUFFLFNBQVM7WUFDZixXQUFXLEVBQUUsd0JBQXdCO1NBQ3hDO0tBQ0o7Q0FDSixDQUFDIn0=