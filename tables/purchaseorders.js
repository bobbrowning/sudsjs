"use strict";
/**
 *
 * Purchase orders table schema
 */
Object.defineProperty(exports, "__esModule", { value: true });
const stock = require('../bin/custom/stock');
module.exports = {
    description: 'Purchase orders',
    friendlyName: 'Purchase Orders',
    permission: { all: ['admin', 'purchasing', 'demo'], view: ['sales'] },
    addRow: 'Add new purchase order',
    list: {
        columns: ['_id', 'supplier', 'date', 'status'],
    },
    open: 'purchaseorderlines',
    properties: {
        /* This inserts a standard header from fragments.js
            The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        supplier: {
            description: 'Supplier ID',
            model: 'user',
            input: {
                type: 'autocomplete',
                required: true,
                search: {
                    andor: 'and',
                    searches: [
                        ['fullName', 'contains', '#input'],
                        ['userType', 'equals', 'S'],
                    ],
                },
                placeholder: 'Number or type name (case sensitive)',
                idPrefix: 'Supplier: ',
            },
            display: {
                openGroup: 'products',
                open: 'purchaseorders',
            },
        },
        date: {
            type: 'string',
            description: 'Date (ISO Format) of order',
            example: '2020-10-29 13:59:58.000',
            input: {
                type: 'date',
                required: true,
                default: '#today',
            },
        },
        notes: {
            description: 'Notes about the order',
            type: 'string',
            input: { type: 'textarea', rows: '5', cols: '40' },
            display: { maxWidth: '400px' },
        },
        status: {
            description: 'Status of the order',
            type: 'string',
            values: {
                A: 'Order placed',
                B: 'Being processed',
                C: 'Dispatched',
                D: 'Confirmed recieved',
            },
            input: {
                type: 'radio',
            }
        },
    },
    children: {
        purchaseorderlines: {
            collection: 'purchaseorderlines',
            via: 'purchaseorder',
            friendlyName: 'Purchase Order lines',
            collectionList: {
                limit: 999,
                order: '_id',
                direction: 'DESC',
                addRow: 'Add a new order line',
                columns: ['product', 'units', 'unitprice', 'total'],
            },
        },
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVyY2hhc2VvcmRlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGFibGVzL3B1cmNoYXNlb3JkZXJzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQTs7O0dBR0c7O0FBRUgsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDN0MsTUFBTSxDQUFDLE9BQU8sR0FBRztJQUNiLFdBQVcsRUFBRSxpQkFBaUI7SUFDOUIsWUFBWSxFQUFFLGlCQUFpQjtJQUMvQixVQUFVLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFO0lBQ3JFLE1BQU0sRUFBRSx3QkFBd0I7SUFDaEMsSUFBSSxFQUFFO1FBQ0YsT0FBTyxFQUFFLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDO0tBQ2pEO0lBQ0QsSUFBSSxFQUFFLG9CQUFvQjtJQUMxQixVQUFVLEVBQUU7UUFDUjt3R0FDZ0c7UUFDaEcsSUFBSSxFQUFFLGtDQUFrQztRQUN4QyxRQUFRLEVBQUU7WUFDTixXQUFXLEVBQUUsYUFBYTtZQUMxQixLQUFLLEVBQUUsTUFBTTtZQUNiLEtBQUssRUFBRTtnQkFDSCxJQUFJLEVBQUUsY0FBYztnQkFDcEIsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsTUFBTSxFQUFFO29CQUNKLEtBQUssRUFBRSxLQUFLO29CQUNaLFFBQVEsRUFBRTt3QkFDTixDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDO3dCQUNsQyxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDO3FCQUM5QjtpQkFDSjtnQkFDRCxXQUFXLEVBQUUsc0NBQXNDO2dCQUNuRCxRQUFRLEVBQUUsWUFBWTthQUN6QjtZQUNELE9BQU8sRUFBRTtnQkFDTCxTQUFTLEVBQUUsVUFBVTtnQkFDckIsSUFBSSxFQUFFLGdCQUFnQjthQUN6QjtTQUNKO1FBQ0QsSUFBSSxFQUFFO1lBQ0YsSUFBSSxFQUFFLFFBQVE7WUFDZCxXQUFXLEVBQUUsNEJBQTRCO1lBQ3pDLE9BQU8sRUFBRSx5QkFBeUI7WUFDbEMsS0FBSyxFQUFFO2dCQUNILElBQUksRUFBRSxNQUFNO2dCQUNaLFFBQVEsRUFBRSxJQUFJO2dCQUNkLE9BQU8sRUFBRSxRQUFRO2FBQ3BCO1NBQ0o7UUFDRCxLQUFLLEVBQUU7WUFDSCxXQUFXLEVBQUUsdUJBQXVCO1lBQ3BDLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7WUFDbEQsT0FBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRTtTQUNqQztRQUNELE1BQU0sRUFBRTtZQUNKLFdBQVcsRUFBRSxxQkFBcUI7WUFDbEMsSUFBSSxFQUFFLFFBQVE7WUFDZCxNQUFNLEVBQUU7Z0JBQ0osQ0FBQyxFQUFFLGNBQWM7Z0JBQ2pCLENBQUMsRUFBRSxpQkFBaUI7Z0JBQ3BCLENBQUMsRUFBRSxZQUFZO2dCQUNmLENBQUMsRUFBRSxvQkFBb0I7YUFDMUI7WUFDRCxLQUFLLEVBQUU7Z0JBQ0gsSUFBSSxFQUFFLE9BQU87YUFDaEI7U0FDSjtLQUNKO0lBQ0QsUUFBUSxFQUFFO1FBQ04sa0JBQWtCLEVBQUU7WUFDaEIsVUFBVSxFQUFFLG9CQUFvQjtZQUNoQyxHQUFHLEVBQUUsZUFBZTtZQUNwQixZQUFZLEVBQUUsc0JBQXNCO1lBQ3BDLGNBQWMsRUFBRTtnQkFDWixLQUFLLEVBQUUsR0FBRztnQkFDVixLQUFLLEVBQUUsS0FBSztnQkFDWixTQUFTLEVBQUUsTUFBTTtnQkFDakIsTUFBTSxFQUFFLHNCQUFzQjtnQkFDOUIsT0FBTyxFQUFFLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDO2FBQ3REO1NBQ0o7S0FDSjtDQUNKLENBQUMifQ==