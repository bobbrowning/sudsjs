"use strict";
/**
 * Product variant table schema
 *
  */
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    friendlyName: 'Main product to Sub product link',
    description: 'Used to link products, such as product/spares or product/accessories.',
    permission: { all: ['admin', 'purchasing', 'demo'], view: ['sales'] },
    stringify: function (record) {
        let suds = require('../config/suds');
        let formatter = new Intl.NumberFormat(suds.currency.locale, {
            style: 'currency',
            currency: suds.currency.currency,
            minimumFractionDigits: suds.currency.digits,
        });
        price = formatter.format(record.price);
        return `${record.name} Guide retail price: ${price}`;
    },
    properties: {
        /* This inserts a standard header from fragments.js
            The dbDriver tag is a kludge to allow the same schema to be used for different databases. */
        $ref: "fragments.js#/{{dbDriver}}Header",
        product: {
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
        name: { type: 'string' },
        price: {
            type: 'number',
            friendlyName: 'Guide retail unit price',
            input: {
                width: '150px',
                step: .01,
                required: true,
            },
            display: { currency: true },
        },
        note: { type: 'string' },
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZHVjdHZhcmlhbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGFibGVzL3Byb2R1Y3R2YXJpYW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQTs7O0lBR0k7O0FBRUosTUFBTSxDQUFDLE9BQU8sR0FBRztJQUNiLFlBQVksRUFBRSxrQ0FBa0M7SUFDaEQsV0FBVyxFQUFFLHVFQUF1RTtJQUNwRixVQUFVLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFO0lBQ3JFLFNBQVMsRUFBRSxVQUFVLE1BQU07UUFDdkIsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDckMsSUFBSSxTQUFTLEdBQUcsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO1lBQ3hELEtBQUssRUFBRSxVQUFVO1lBQ2pCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVE7WUFDaEMscUJBQXFCLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNO1NBQzlDLENBQUMsQ0FBQztRQUNILEtBQUssR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2QyxPQUFPLEdBQUcsTUFBTSxDQUFDLElBQUksd0JBQXdCLEtBQUssRUFBRSxDQUFDO0lBQ3pELENBQUM7SUFDRCxVQUFVLEVBQUU7UUFDUjt3R0FDZ0c7UUFDaEcsSUFBSSxFQUFFLGtDQUFrQztRQUN4QyxPQUFPLEVBQUU7WUFDTCxLQUFLLEVBQUUsVUFBVTtZQUNqQixLQUFLLEVBQUU7Z0JBQ0gsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLEtBQUssRUFBRSxDQUFDO2dCQUNSLE1BQU0sRUFBRTtvQkFDSixLQUFLLEVBQUUsS0FBSztvQkFDWixRQUFRLEVBQUU7d0JBQ04sQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQztxQkFDakM7aUJBQ0o7Z0JBQ0QsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osU0FBUyxFQUFFLENBQUM7Z0JBQ1osV0FBVyxFQUFFLHNDQUFzQztnQkFDbkQsUUFBUSxFQUFFLGtCQUFrQjthQUMvQjtZQUNELE9BQU8sRUFBRTtnQkFDTCxXQUFXLEVBQUUsU0FBUztnQkFDdEIsUUFBUSxFQUFFLElBQUksRUFBRSxxQ0FBcUM7YUFDeEQ7U0FDSjtRQUNELElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7UUFDeEIsS0FBSyxFQUFFO1lBQ0gsSUFBSSxFQUFFLFFBQVE7WUFDZCxZQUFZLEVBQUUseUJBQXlCO1lBQ3ZDLEtBQUssRUFBRTtnQkFDSCxLQUFLLEVBQUUsT0FBTztnQkFDZCxJQUFJLEVBQUUsR0FBRztnQkFDVCxRQUFRLEVBQUUsSUFBSTthQUNqQjtZQUNELE9BQU8sRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7U0FDOUI7UUFDRCxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO0tBQzNCO0NBQ0osQ0FBQyJ9