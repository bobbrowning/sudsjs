"use strict";
/**
 * Products table schema
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = {
    friendlyName: 'Design Documents',
    description: `Design documents for CouchDB.`,
    /**
     * The stringify function creates a human-friendly descriotion of the record
     * It returns the name of the product blus a list of prices from the variants array
     * Example: "E-Bike Battery (Guide retail price(s): £85.00 / £180.00)"
     *
     * @param {object} record
     * @returns {string} Description of record
     */
    stringify: function (record) {
        return record._id;
    },
    list: {
        columns: ['name', 'supplier', 'productGroup'],
    },
    permission: { all: ['admin', 'demo'] },
    /**
     * The input and display screens are divided into groups. Any field not included in any group
     * are put in the 'other' group.
     */
    _id: {
        friendlyName: 'Document ID',
        primaryKey: true,
        type: 'string',
    },
    _rev: {
        friendlyName: 'Document revision',
        type: 'string',
        permission: { view: ['admin'], edit: ['all'] }, // edited by the system, but as most users can't see it they can't edit it manually
    },
    views: {
        type: 'object',
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVzaWduZG9jdW1lbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RhYmxlcy9kZXNpZ25kb2N1bWVudHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBOzs7R0FHRzs7QUFFSCxNQUFNLENBQUMsT0FBTyxHQUFHO0lBQ2IsWUFBWSxFQUFFLGtCQUFrQjtJQUNoQyxXQUFXLEVBQUUsK0JBQStCO0lBQzVDOzs7Ozs7O09BT0c7SUFDSCxTQUFTLEVBQUUsVUFBVSxNQUFNO1FBQ3ZCLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUN0QixDQUFDO0lBQ0QsSUFBSSxFQUFFO1FBQ0YsT0FBTyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLENBQUM7S0FDaEQ7SUFDRCxVQUFVLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUU7SUFDdEM7OztPQUdHO0lBQ0gsR0FBRyxFQUFFO1FBQ0QsWUFBWSxFQUFFLGFBQWE7UUFDM0IsVUFBVSxFQUFFLElBQUk7UUFDaEIsSUFBSSxFQUFFLFFBQVE7S0FDakI7SUFDRCxJQUFJLEVBQUU7UUFDRixZQUFZLEVBQUUsbUJBQW1CO1FBQ2pDLElBQUksRUFBRSxRQUFRO1FBQ2QsVUFBVSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxtRkFBbUY7S0FDdEk7SUFDRCxLQUFLLEVBQUU7UUFDSCxJQUFJLEVBQUUsUUFBUTtLQUNqQjtDQUNKLENBQUMifQ==