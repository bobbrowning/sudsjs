
/**
 * Products table schema
 *
 */

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
