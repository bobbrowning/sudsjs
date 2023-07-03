"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** *****************************************************
 *
 * Web Pages table schema
 *
 * **************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2VicGFnZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGFibGVzL3dlYnBhZ2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFDYjs7OzswREFJMEQ7QUFDMUQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7QUFDOUQsTUFBTSxDQUFDLE9BQU8sR0FBRztJQUNiLFlBQVksRUFBRSxXQUFXO0lBQ3pCLFdBQVcsRUFBRTs7Ozs7aUNBS2dCO0lBQzdCLFVBQVUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUU7SUFDN0Q7Ozs7O1NBS0s7SUFDTCxnQkFBZ0IsRUFBRSxVQUFVO0lBQzVCO3NEQUNrRDtJQUNsRCxJQUFJLEVBQUU7UUFDRixPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQztLQUN2RTtJQUNEO3lDQUNxQztJQUNyQyxTQUFTLEVBQUUsT0FBTztJQUNsQiw4RUFBOEU7SUFDOUUsTUFBTSxFQUFFO1FBQ0osS0FBSyxFQUFFO1lBQ0gsTUFBTSxFQUFFLElBQUk7WUFDWixPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQztTQUN6QztRQUNELFFBQVEsRUFBRTtZQUNOLFlBQVksRUFBRSxVQUFVO1lBQ3hCLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRTtTQUNuRjtRQUNELFFBQVEsRUFBRTtZQUNOLFlBQVksRUFBRSxnQkFBZ0I7WUFDOUIsT0FBTyxFQUFFLENBQUMsWUFBWSxF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