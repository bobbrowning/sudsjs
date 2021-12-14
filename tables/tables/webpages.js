
/** *****************************************************
 *
 * Web Pages configuration file
 * Webpages.js
 * 
 * One row for each web page 
 *
 * **************************************************** */



module.exports = {
    friendlyName: 'Web pages',
    description: 'Web pages for the starter content management system',

    /** Only the superuser can edit this page. */
    permission: {view: ['admin','web','demo'] },

    /** One column can be assigned as the record  type. 
     *  Different record types may be able to view different groups of columns. 
     *  The two record types at present are 
     *    H: Plain old HTML and 
     *    R: Redirect/Alias
     * */
    recordTypeColumn: 'pagetype',

    /** 'normal' columns for a table listing.  The detailed listing of each row will have 
     *   every column the user is permitted to see. */
    list: {
        columns: ['pageno', 'title', 'slug', 'pagetype', 'status', 'parent', 'onMenu'],
    },

    /** This determines how each row is to be described in things like links. 
     *  In this case the title column. */
    rowTitle: 'title',
 
    /** The columns are split into groups for the row listing and the edit form */
    groups: {
        basic: {
            static: true,
            columns: ['title', 'pagetype', 'slug'],
        },
        settings: {
            friendlyName: 'Settings',
            columns: ['status','parent', 'onMenu', 'expires', 'embargo', 'view',],
        },
        redirect: {
            friendlyName: 'Redirect/alias',
            columns: ['targetPage', 'targetUrl', 'openIn'],
            recordTypes: ['R'],                                // Only for redirect
        },
        content: {
            friendlyName: 'Page Content',
            columns: ['headline', 'author', 'pageContent'],
            recordTypes: ['H'],                               //  Only for HTML 
        },
        files: {
            friendlyName: 'Images/Files',
            columns: ['image1', 'image2', 'image3', 'image4', 'image5'],
            recordTypes: ['H'],
        },
        subpages: {
            friendlyName: 'Sub pages',
            columns: [ 'subpages',],
            /** When the group is loaded, these child records will be visible */
            open: 'subpages',
        },

    },

    /** 
     *       ATTRIBUTES
     * 
     * One entry per column in the table.  
     *   friendlyName is the name displayed for that column. If onmitted the field name 
     *     is 'humanised' (fooBar would become 'Foo Bar')
     *   description is used in the tooltip for that field in the update form as well as 
     *     being documentation.  If omitted the friendlyName is used.
     */
    attributes: {
        pageno: {
            friendlyName: 'Page No',
            type: 'number',
            primaryKey: true,
            autoincrement: true,
        },
        createdAt: {
            friendlyName: 'Date created',
            type: 'number',
            display: { type: 'datetime', truncateForTableList: 16 },   // when displayed on the table list only the first 16 characters are shown.
            database: { type: 'biginteger' },                          // special type when creating the database
            process: { createdAt: true }                               // This is created by the system               
        },
        updatedAt: {
            friendlyName: 'Date last updated',
            type: 'number',
            display: { type: 'datetime', truncateForTableList: 16 },
            database: { type: 'biginteger' },
            process: { updatedAt: true }
        },
        updatedBy: {
            friendlyName: 'Last updated by',
            description: `The person who last updated the row.`,
            type: 'number',
            model: 'user',                                             // This is a foreign key linking to the user table
            process: { updatedBy: true },                              // The link is made automatically
        },

        title: {
            type: 'string',
            description: 'This is to identify the page. Note that this is used on the menu.',
        },


        pagetype: {
            friendlyName: 'Page type',
            description: 'Cannot be changed once set',
            type: 'text',
            input: {
                required: true,
                type: 'select',                                          // Select drop-down list
                recordTypeFix: true,                                     // Once selected can't be changed (except by the superuser)
            },
            values: {
                H: 'Plain old HTML',
                R: 'Redirect',
            },
        },

        slug: {                                                      // Used to create the URL of the page. Must be unique
            type: 'string',
            input: {
                required: true,
                type: 'text',
                validations: {
                    api: {                                         // Validation is by module in bin/suds/api/unique.js
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
            model: 'webpages',                                      // This is a circular link to another row in this table
            description: 'The page above this one in the hierarchy',
            friendlyName: 'Parent page',
            input: {
                type: 'autocomplete',                                // user starts typing the name and a short list of candidates is given
                search: 'title',                                     // the input might be the id (always) or part of the title
                placeholder: 'Start typing page title (case sensitive)',
                width: '80%',                                         // To allow for the clear symbol 
            },
        },

        onMenu: {
            friendlyName: 'Menu order (omitted if off menu)',
            type: 'number',
            display: { tableHeading: 'Menu Order' },
        },

        status: {
            friendlyName: 'Page status',
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


        author: {
            model: 'user',                                          // This is a foreign key of the user table 
            description: 'The Author or maintainer of this page.',
            friendlyName: 'Original author',
            input: {
                width: '80%',
                type: 'autocomplete',
                search: 'fullName',
                placeholder: 'Number or type name (case sensitive)',
                default: '#loggedInUser',                           // special code for the logged in user.
            },
        },
        /**   Redirect only  */
        targetPage: {
            type: 'number',
            model: 'webpages',
            input: {
                type: 'autocomplete',
                search: 'title',
                placeholder: 'Start typing page title (case sensitive)',
                width: '80%',
            },
        },
        targetUrl: {
            type: 'text',
        },
        openIn: {
            type: 'text',
            values: {
                T: 'This window',
                W: 'Another window',
            }
        },

        /**   HTML page  only  */
        pageContent: {
            type: 'string',
            description: `This is the main content of the page. 
            If you want to include images, you can go to the images section 
            and upload an image. Then submit.  Go back to edit / images. 
            The image you upload will have a link. Click with the right 
            mouse button and copy the link. Then use the image function 
            on this page and paste the URL. `,
            input: {
                format: 'col',
                type: 'ckeditor4',                          // Other rich text editors are available see config & notes in suds.js
                height: 300,
                placeholder: 'Please enter page content',
            },
            display: { truncateForTableList: 50 },
        },

        view: {
            type: 'string',
            values: function () {
                return require('../config/suds').views;          // The views are stored in the suds.js config file
            },
            input: {
                type: 'select',
            }
        },
        /** upload files. The uploaded files will be given a unique name unless keepFileName is true  */
        image1: {
            type: 'text',
            input: { type: 'uploadFile', },
        },

        image2: {
            type: 'text',
            input: { type: 'uploadFile', },
        },

        image3: {
            type: 'text',
            input: { type: 'uploadFile', },
        },
        image4: {
            type: 'text',
            input: { type: 'uploadFile', },
        },
        image5: {
            type: 'text',
            input: { type: 'uploadFile', },
        },

        /** This is not a real column in the database. But it defines how child rows are to be displayed.    */
        subpages: {
            collection: 'webpages',                      // Tbe collection is the child table
            via: 'parent',                               // The column in the child record that links to this
            collectionList: {                            // How child records are to be displayed
                heading: 'Sub pages',                    //Heading to the listing 
                columns: ['pageno', 'title', 'slug', 'pagetype', 'status', 'onMenu'],
                sort: ['onMenu', 'ASC'],
            },
        },
    },


};

