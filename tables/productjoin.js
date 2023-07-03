"use strict";
/**
 * Product Joins table schema
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    friendlyName: 'Main product to Sub product link',
    description: 'Used to link products, such as product/spares or product/accessories.',
    permission: { all: ['admin', 'purchasing', 'demo'], view: ['sales'] },
    properties: {
        /* This inserts a standard header from fragments.js
           The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        mainproduct: {
            model: 'products',
            input: {
                type: 'autocomplete',
                limit: 5,
                search: {
                    andor: 'and',
                    searches: [
                        ['name', 'contains', '#input'],
                    ],
                },
                width: '80%',
                minLength: 2,
                placeholder: 'Number or type name (case sensitive)',
                idPrefix: 'Product number: ',
            },
            display: {
                linkedTable: 'product',
                makeLink: true, // hypertext link to the linked table
            },
        },
        subproduct: {
            model: 'products',
            child: false,
            input: {
                type: 'autocomplete',
                limit: 5,
                search: {
                    andor: 'or',
                    searches: [
                        ['name', 'contains', '#input'],
                    ],
                },
                width: '80%',
                minLength: 2,
                placeholder: 'Number or type name (case sensitive)',
                idPrefix: 'Product number: ',
            },
            display: {
                linkedTable: 'product',
                makeLink: true, // hypertext link to the linked table
            },
        },
        type: {
            input: { type: 'radio' },
            values: {
                C: 'Component / spare part',
                A: 'Accessory',
            }
        }
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZHVjdGpvaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGFibGVzL3Byb2R1Y3Rqb2luLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQTs7O0dBR0c7O0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRztJQUNiLFlBQVksRUFBRSxrQ0FBa0M7SUFDaEQsV0FBVyxFQUFFLHVFQUF1RTtJQUNwRixVQUFVLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFO0lBQ3JFLFVBQVUsRUFBRTtRQUNSO3VHQUMrRjtRQUMvRixJQUFJLEVBQUUsa0NBQWtDO1FBQ3hDLFdBQVcsRUFBRTtZQUNULEtBQUssRUFBRSxVQUFVO1lBQ2pCLEtBQUssRUFBRTtnQkFDSCxJQUFJLEVBQUUsY0FBYztnQkFDcEIsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsTUFBTSxFQUFFO29CQUNKLEtBQUssRUFBRSxLQUFLO29CQUNaLFFBQVEsRUFBRTt3QkFDTixDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDO3FCQUNqQztpQkFDSjtnQkFDRCxLQUFLLEVBQUUsS0FBSztnQkFDWixTQUFTLEVBQUUsQ0FBQztnQkFDWixXQUFXLEVBQUUsc0NBQXNDO2dCQUNuRCxRQUFRLEVBQUUsa0JBQWtCO2FBQy9CO1lBQ0QsT0FBTyxFQUFFO2dCQUNMLFdBQVcsRUFBRSxTQUFTO2dCQUN0QixRQUFRLEVBQUUsSUFBSSxFQUFFLHFDQUFxQzthQUN4RDtTQUNKO1FBQ0QsVUFBVSxFQUFFO1lBQ1IsS0FBSyxFQUFFLFVBQVU7WUFDakIsS0FBSyxFQUFFLEtBQUs7WUFDWixLQUFLLEVBQUU7Z0JBQ0gsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLEtBQUssRUFBRSxDQUFDO2dCQUNSLE1BQU0sRUFBRTtvQkFDSixLQUFLLEVBQUUsSUFBSTtvQkFDWCxRQUFRLEVBQUU7d0JBQ04sQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQztxQkFDakM7aUJBQ0o7Z0JBQ0QsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osU0FBUyxFQUFFLENBQUM7Z0JBQ1osV0FBVyxFQUFFLHNDQUFzQztnQkFDbkQsUUFBUSxFQUFFLGtCQUFrQjthQUMvQjtZQUNELE9BQU8sRUFBRTtnQkFDTCxXQUFXLEVBQUUsU0FBUztnQkFDdEIsUUFBUSxFQUFFLElBQUksRUFBRSxxQ0FBcUM7YUFDeEQ7U0FDSjtRQUNELElBQUksRUFBRTtZQUNGLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUU7WUFDeEIsTUFBTSxFQUFFO2dCQUNKLENBQUMsRUFBRSx3QkFBd0I7Z0JBQzNCLENBQUMsRUFBRSxXQUFXO2FBQ2pCO1NBQ0o7S0FDSjtDQUNKLENBQUMifQ==