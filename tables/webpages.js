
/* *****************************************************
 *
 *    Web Pages model file
 *    Webpages.js
 *
 * **************************************************** */


module.exports = {
    description: 'Web Pages',
    permission: { all: ['admin', 'web'] },
    list: {
        columns: ['pageno', 'slug', 'title', 'author', 'status'],
    },
    groups: {
        basic: {
            static: true,
            columns: ['title', 'headline', 'status', 'author'],
        },
        content: {
            columns: ['pageContent'],
        },
        placement: {
            columns: ['slug', 'onMenu', 'parent', 'tags',],
        },
    },
    rowTitle: function (record) {
        return record['title'];
    },



    attributes: {
        pageno: {
            friendlyName: 'Page No',                            // Visible name 
            type: 'number',
            primaryKey: true,
            autoincrement: true,
        },
        createdAt: {
            friendlyName: 'Date created',
            type: 'number',
            display: { type: 'datetime', truncateForTableList: 16 },
            database: { type: 'biginteger' },
            process: { createdAt: true }
        },                                      // You don't actually enter these
        updatedAt: {                            // but if you did they would be dates. 
            friendlyName: 'Date last updated',    // so this also governs how they are diaplayed
            type: 'number',
            display: { type: 'datetime', truncateForTableList: 16 },
            database: { type: 'biginteger' },
            process: { updatedAt: true }
        },
        updatedBy: {
            friendlyName: 'Last updated by',
            description: `The person who last updated the row.`,
                  type: 'number',
            model: 'user',
            process: { updatedBy: true }
        },

        title: { type: 'string' },
        slug: { type: 'string', },
        status: {
            type: 'string',
            input: {
                type: 'radio',
                values: {
                    'D': 'Draft',
                    'P': 'Published',
                    'X': 'Expired',

                }
            }
        },
        embargo: {
            type: 'string',
            description: 'Embargo Date (ISO Format)',
            input: { type: 'date', width: '220px' },
            display: { type: 'date' },
        },
        expires: {
            type: 'string',
            description: 'Expiry Date (ISO Format)',
            input: { type: 'date', width: '220px' },
            display: { type: 'date' },
        },
        parent: {
            model: 'webpages',
            description: 'The page above this one in the hierarchy',
            friendlyName: 'Parent page',
            input: {
                type: 'autocomplete',
                search: 'title',
                placeholder: 'Start typing page title (case sensitive)',
                idPrefix: 'Parent Page: ',
            },
        },
        onMenu: { type: 'boolean' },
        headline: { type: 'string' },
        tags: { type: 'string' },
        author: {
            model: 'user',
            description: 'The Author or maintainer of this page.',
            friendlyName: 'Original author of the page',
            input: {

                type: 'autocomplete',
                search: 'fullName',
                placeholder: 'Number or type name (case sensitive)',
                default: '#loggedInUser',
            },
        },

        pageContent: {
            type: 'string',
            input: {
                format: 'col',
                type: 'summernote',
                height: 300,
                placeholder: 'Please enter page content'
            },
            display: { truncateForTableList: 50 },
        },
    }
};

