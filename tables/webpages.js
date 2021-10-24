
/* *****************************************************
 *
 *    Web Pages model file
 *    Webpages.js
 *
 * **************************************************** */


module.exports = {
    friendlyName: 'Web pages',
    description: 'Web pages for the basic content management system',
    permission: { all: ['admin', 'web'], read: ['#guest#'] },
    list: {
        columns: ['pageno', 'title', 'slug', 'pagetype', 'status', 'parent', 'onMenu'],
    },
    groups: {
        basic: {
            static: true,
            columns: ['title', 'pagetype', 'slug', 'status', 'author'],
        },
        settings: {
            friendlyName: 'Settings',
            columns: ['onMenu', 'parent', 'tags', 'expires', 'embargo', 'view'],
        },
        content: {
            friendlyName: 'Page Content',
            columns: ['headline', 'pageContent',],
        },
        files: {
            friendlyName: 'Images/Files',
            columns: ['image1', 'image2', 'image3', 'image4', 'image5'],
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
        pagetype: {
            type: 'text',
            values: {
                H: 'Plain old HTML',
            },
            input: {
                required: true,
                type: 'select',
            }
        },
        slug: {
            type: 'string',
            input: {
                required: true,
                type: 'text',
                validations: {
                    api: {
                        route: '/unique',
                    }
                }

            },
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
                width: '80%',
            },
        },
        onMenu: {
            friendlyName: 'Menu order (omit if off menu)',
            type: 'number',
            display: { tableHeading: 'Menu Order' },
        },
        status: {
            type: 'string',
            values: {
                'D': 'Draft',
                'P': 'Published',
                'H': 'On hold',

            },
            input: {
                required: true,
                type: 'radio',
            }
        },
        headline: { type: 'string', },
        tags: { type: 'string' },
        author: {
            model: 'user',
            description: 'The Author or maintainer of this page.',
            friendlyName: 'Original author',
            input: {
                width: '80%',
                type: 'autocomplete',
                search: 'fullName',
                placeholder: 'Number or type name (case sensitive)',
                default: '#loggedInUser',
            },
        },
        pageContent: {
            type: 'string',
            description: `This is the main content of the page. `,
            input: {
                format: 'col',
                type: 'ckeditor4',
                height: 300,
                placeholder: 'Please enter page content',
            },
            display: { truncateForTableList: 50 },
        },




        view: {
            type: 'string',
            values: function () {
                return require('../config/suds').views;
            },
            input: {
                type: 'select',
            }
        },
        /** upload file. The uploaded file will be given a unique name unless keepFileName is true  */
        image1: {
            type: 'text',
            input: { type: 'uploadFile', keepFileName: true },
        },

        image2: {
            type: 'text',
            input: { type: 'uploadFile', keepFileName: true },
        },

        image3: {
            type: 'text',
            input: { type: 'uploadFile', keepFileName: true },
        },
        image4: {
            type: 'text',
            input: { type: 'uploadFile', keepFileName: true },
        },
        image5: {
            type: 'text',
            input: { type: 'uploadFile', keepFileName: true },
        },
    },


};

