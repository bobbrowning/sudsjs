
/** *****************************************************
 *
 * Web Pages table schema
 *
 * **************************************************** */

module.exports = {
    friendlyName: 'Web pages',
    description: `Web pages for the starter content management system. There is one row per page. 
    The primary identifier for each page is called a 'slug'. So accessing a page is /page/[slug].
    There is a page type field which can be 'H' for a normal HTML page and 'R' for a redirect page.
    When a new page is created the system first asks for the page type and then presents only 
    the appropriate fields for that type.  A redirect page simply results in the target page
    being presented to the user.`,
    permission: { view: ['admin', 'demo', 'web'], edit: ['web'] },
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
        columns: ['title', 'slug', 'pagetype', 'status', 'parent', 'onMenu'],
    },
    /** This determines how each row is to be described in things like links.
     *  In this case the title column. */
    stringify: 'title',
    /** The columns are split into groups for the row listing and the edit form */
    groups: {
        basic: {
            static: true,
            columns: ['title', 'pagetype', 'slug'],
        },
        settings: {
            friendlyName: 'Settings',
            columns: ['author', 'status', 'parent', 'onMenu', 'expires', 'embargo', 'view',],
        },
        redirect: {
            friendlyName: 'Redirect/alias',
            columns: ['targetPage', 'targetUrl', 'openIn'],
            recordTypes: ['R'], // Only for redirect
        },
        content: {
            friendlyName: 'Page Content',
            columns: ['headline', 'pageContent'],
            recordTypes: ['H'], //  Only for HTML 
        },
        files: {
            friendlyName: 'Images/Files',
            columns: ['image1', 'image2', 'image3', 'image4', 'image5'],
            recordTypes: ['H'],
        },
        subpages: {
            friendlyName: 'Sub pages',
            columns: ['subpages',],
            /** When the group is loaded, these child records will be visible */
            open: 'subpages',
        },
        technical: {
            friendlyName: 'Technical settings',
            columns: ['titleTag', 'metaDescription', 'headerTags',],
            recordTypes: ['H'], //  Only for HTML 
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
    properties: {
        /* This table doesn't have a standard header. The primary key is noy id or _id */
        pageno: {
            friendlyName: 'Document ID',
            primaryKey: true,
            autoincrement: true,
            type: 'string',
            permission: { view: ['admin'], edit: ['all'] }, // edited by the system, but as most users can't see it they can't edit it manually
        },
        createdAt: {
            friendlyName: 'Date created',
            type: 'number',
            database: { type: 'bigint' },
            display: { type: 'datetime', truncateForTableList: 16 },
            input: { type: 'date' },
            process: { type: 'createdAt' },
            permission: { view: ['none'] },
        },
        updatedAt: {
            friendlyName: 'Date last updated',
            database: { type: 'bigint' },
            type: 'number',
            display: { type: 'datetime', truncateForTableList: 16 },
            input: { type: 'date' },
            process: { type: 'updatedAt' },
            permission: { view: ['none'] },
        },
        updatedBy: {
            friendlyName: 'Last updated by',
            description: `The person who last updated the row.`,
            type: 'number',
            model: 'user',
            process: { type: 'updatedBy' },
            permission: { view: ['none'] },
        },
        title: {
            type: 'string',
            description: 'This is to identify the page. Note that this is used on the menu.',
        },
        pagetype: {
            friendlyName: 'Page type',
            description: 'Cannot be changed once set',
            type: 'string',
            input: {
                required: true,
                type: 'select',
                recordTypeFix: true, // Once selected can't be changed (except by the superuser)
            },
            values: {
                H: 'Plain old HTML',
                R: 'Redirect',
            },
        },
        /** Used to create the URL of the page. Must be unique  */
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
        /** Dates can be type number or string. If it is a number it is the mumber of milliseconds since 1/1/70
         * If it is string it is ISO format.      */
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
                width: '80%', // To allow for the clear symbol 
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
        headline: {
            type: 'string',
        },
        author: {
            model: 'user',
            description: 'The Author or maintainer of this page.',
            friendlyName: 'Original author',
            input: {
                width: '80%',
                type: 'autocomplete',
                search: 'fullName',
                placeholder: 'Number or type name (case sensitive)',
                default: '#loggedInUser', // special code for the logged in user.
            },
        },
        /**   Redirect only  */
        targetPage: {
            type: 'number',
            friendlyName: 'Target page for redirect',
            model: 'webpages',
            input: {
                type: 'autocomplete',
                search: 'title',
                placeholder: 'Start typing page title (case sensitive)',
                width: '80%',
            },
        },
        targetUrl: {
            friendlyName: 'Target URL for redirect',
            type: 'string',
        },
        openIn: {
            friendlyName: 'Open target in',
            type: 'string',
            values: {
                T: 'This window',
                W: 'Another window',
            },
            input: { type: 'radio' }
        },
        /**   HTML page  only  */
        pageContent: {
            type: 'string',
            database: { type: 'text' },
            description: `This is the main content of the page. 
            If you want to include images, you can go to the images section 
            and upload an image. Then submit.  Go back to edit / images. 
            The image you upload will have a link. Click with the right 
            mouse button and copy the link. Then use the image function 
            on this page and paste the URL. `,
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
                return require('../config/suds').views; // The views are stored in the suds.js config file
            },
            input: {
                type: 'select',
            }
        },
        /** upload files. The uploaded files will be given a unique name unless keepFileName is true  */
        image1: {
            type: 'string',
            input: { type: 'uploadFile', },
        },
        image2: {
            type: 'string',
            input: { type: 'uploadFile', },
        },
        image3: {
            type: 'string',
            input: { type: 'uploadFile', },
        },
        image4: {
            type: 'string',
            input: { type: 'uploadFile', },
        },
        image5: {
            type: 'string',
            input: { type: 'uploadFile', },
        },
        titleTag: {
            type: 'string',
            friendlyName: 'title for the &lt;title&gt; tag',
        },
        metaDescription: {
            type: 'string',
            friendlyName: 'meta data - description tag',
            description: 'Description of this page fr search engines.',
            input: { type: 'textarea' },
        },
        headerTags: {
            type: 'string',
            friendlyName: 'Other header tags',
            description: 'Additional tags for the heading section of the page.',
            input: { type: 'textarea' },
            display: { type: 'html' },
        },
        /** This is not a real column in the database. But it defines how child rows are to be displayed.    */
        subpages: {
            description: `Pages below this page in the hierarchy of pages.`,
            collection: 'webpages',
            via: 'parent',
            collectionList: {
                heading: 'Sub pages',
                columns: ['title', 'slug', 'pagetype', 'status', 'onMenu'],
                sort: ['onMenu', 'ASC'],
            },
        },
    },
};
